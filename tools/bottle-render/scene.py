import bpy, bmesh, math, sys, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

MODE = sys.argv[sys.argv.index('--') + 1]  # empty | full | cap | vial
OUT = sys.argv[sys.argv.index('--') + 2]
SAMPLES = int(sys.argv[sys.argv.index('--') + 3]) if len(sys.argv) > sys.argv.index('--') + 3 else 160

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
scn.render.engine = 'CYCLES'
scn.cycles.device = 'CPU'
scn.cycles.samples = SAMPLES
scn.cycles.use_denoising = True
scn.cycles.max_bounces = 24
scn.cycles.transmission_bounces = 24
scn.cycles.glossy_bounces = 12
scn.cycles.transparent_max_bounces = 24
scn.cycles.caustics_reflective = False
scn.cycles.caustics_refractive = False
scn.cycles.blur_glossy = 1.0
scn.view_settings.view_transform = 'AgX'
scn.view_settings.look = 'AgX - Medium High Contrast'
scn.render.image_settings.file_format = 'PNG'
scn.render.image_settings.color_mode = 'RGBA'
scn.render.film_transparent = MODE in ('cap', 'vial')
if MODE == 'vial':
    scn.cycles.film_transparent_glass = True
W, H = (1000, 1300) if MODE != 'vial' else (360, 480)
scn.render.resolution_x, scn.render.resolution_y = W, H
scn.render.resolution_percentage = 100


def mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links


def principled(m):
    return m.node_tree.nodes['Principled BSDF']


def fillet(pts, rad, seg=6):
    """Round the interior corners of an open polyline of (r, z)."""
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        p0, p1, p2 = Vector(pts[i - 1]), Vector(pts[i]), Vector(pts[i + 1])
        r = rad[i] if isinstance(rad, list) else rad
        if r <= 0:
            out.append(tuple(p1)); continue
        a = (p0 - p1).normalized(); b = (p2 - p1).normalized()
        r = min(r, (p0 - p1).length * .45, (p2 - p1).length * .45)
        s = p1 + a * r; e = p1 + b * r
        for k in range(seg + 1):
            t = k / seg
            q = (1 - t) ** 2 * s + 2 * (1 - t) * t * p1 + t ** 2 * e
            out.append((q.x, q.y))
    out.append(pts[-1])
    return out


def lathe(name, profile, steps=128, closed=True):
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    if closed:
        edges.append(bm.edges.new((verts[-1], verts[0])))
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    scn.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    mod = ob.modifiers.new('sm', 'SMOOTH_BY_ANGLE') if hasattr(bpy.types, 'NodesModifier') and False else None
    return ob


# ---------- materials
glass, gn, gl = mat('Glass')
pg = principled(glass)
pg.inputs['Base Color'].default_value = (0.98, 0.99, 0.985, 1)
pg.inputs['Roughness'].default_value = 0.0
pg.inputs['IOR'].default_value = 1.5
pg.inputs['Transmission Weight'].default_value = 1.0

liquid, ln, ll = mat('Liquid')
pl = principled(liquid)
pl.inputs['Base Color'].default_value = (1, 1, 1, 1)
pl.inputs['Roughness'].default_value = 0.0
pl.inputs['IOR'].default_value = 1.36
pl.inputs['Transmission Weight'].default_value = 1.0
pl.inputs['Subsurface Weight'].default_value = 0.0

wood, wn, wl = mat('Wood')
pw = principled(wood)
tc = wn.new('ShaderNodeTexCoord')
mp = wn.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1.0, 1.0, 9.0)
wave = wn.new('ShaderNodeTexWave'); wave.wave_type = 'BANDS'; wave.bands_direction = 'Z'
wave.inputs['Scale'].default_value = 1.6; wave.inputs['Distortion'].default_value = 7.0
wave.inputs['Detail'].default_value = 4.0; wave.inputs['Detail Scale'].default_value = 1.6
noise = wn.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 60; noise.inputs['Detail'].default_value = 8
ramp = wn.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.20, 0.085, 0.035, 1)
ramp.color_ramp.elements[1].color = (0.52, 0.27, 0.13, 1)
ramp.color_ramp.elements.new(0.55).color = (0.38, 0.18, 0.08, 1)
mix = wn.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'
mix.inputs['Factor'].default_value = 0.25
bump = wn.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.08
wl.new(tc.outputs['Object'], mp.inputs['Vector'])
wl.new(mp.outputs['Vector'], wave.inputs['Vector'])
wl.new(wave.outputs['Fac'], ramp.inputs['Fac'])
wl.new(ramp.outputs['Color'], mix.inputs['A'])
wl.new(noise.outputs['Color'], mix.inputs['B'])
wl.new(mix.outputs['Result'], pw.inputs['Base Color'])
wl.new(wave.outputs['Fac'], bump.inputs['Height'])
wl.new(bump.outputs['Normal'], pw.inputs['Normal'])
pw.inputs['Roughness'].default_value = 0.42
pw.inputs['Coat Weight'].default_value = 0.25
pw.inputs['Coat Roughness'].default_value = 0.2

brass, _, _ = mat('Brass')
pb = principled(brass)
pb.inputs['Base Color'].default_value = (0.86, 0.66, 0.40, 1)
pb.inputs['Metallic'].default_value = 1.0
pb.inputs['Roughness'].default_value = 0.22

backdrop_m, bn, bl = mat('Backdrop')
pbk = principled(backdrop_m)
pbk.inputs['Base Color'].default_value = (0.86, 0.70, 0.58, 1)
pbk.inputs['Roughness'].default_value = 0.85


def emissive(name, strength, color=(1, 0.97, 0.92)):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes['Principled BSDF'])
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*color, 1)
    em.inputs['Strength'].default_value = strength
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    return m


# ---------- geometry
S = 1.0 if MODE != 'vial' else 1.0
if MODE != 'vial':
    R, Rin = 1.0, 0.915
    outer = [(0.0, 0.0), (R - .02, 0.0), (R, 0.06), (R, 2.30), (R, 2.48), (0.40, 2.70), (0.40, 2.70), (0.36, 2.72), (0.36, 3.02), (0.0, 3.02)]
    outer = [(0.0, 0.0), (R, 0.0), (R, 2.40), (0.40, 2.66), (0.38, 2.68), (0.38, 3.00), (0.0, 3.00)]
    out_f = fillet(outer, [0, .05, .42, .06, .02, .02, 0], 8)
    inner = [(0.0, 2.99), (0.29, 2.99), (0.29, 2.62), (Rin, 2.36), (Rin, 0.42), (0.0, 0.42)]
    in_f = fillet(inner, [0, .01, .06, .36, .08, 0], 8)
    # glass solid: outer up to the lip, then down the inner wall
    lip = [(0.38, 3.0), (0.29, 3.0)]
    prof = out_f[:-1] + [(0.335, 3.012)] + in_f[1:]
    bottle = lathe('Bottle', prof, closed=False)
    bottle.data.materials.append(glass)
    LIQ_BOTTOM, LIQ_TOP = 0.425, 2.30
    if MODE == 'full':
        lr = Rin - 0.004
        lp = fillet([(0.0, LIQ_BOTTOM), (lr, LIQ_BOTTOM), (lr, LIQ_TOP), (0.0, LIQ_TOP)], [0, .075, .0, 0], 8)
        liq = lathe('Liquid', lp, closed=False)
        liq.data.materials.append(liquid)
    # wooden cap (only in cap mode it is renderable)
    cp = fillet([(0.0, 2.64), (0.56, 2.64), (0.56, 3.48), (0.0, 3.48)], [0, .05, .09, 0], 8)
    cap = lathe('Cap', cp, closed=False)
    cap.data.materials.append(wood)
    ring = lathe('Ring', fillet([(0.0, 2.62), (0.57, 2.62), (0.57, 2.69), (0.0, 2.69)], [0, .015, .015, 0], 3), closed=False)
    ring.data.materials.append(brass)
    if MODE != 'cap':
        cap.hide_render = True; ring.hide_render = True
    else:
        bottle.is_holdout = True  # cap occluded by nothing; holdout keeps alpha clean
        bottle.hide_render = True
else:
    R, Rin = 0.30, 0.25
    out_f = fillet([(0.0, 0.0), (R, 0.0), (R, 1.25), (0.0, 1.25)], [0, .12, .0, 0], 8)
    in_f = fillet([(0.0, 1.25), (Rin, 1.25), (Rin, 0.08), (0.0, 0.08)], [0, .0, .1, 0], 8)
    vial = lathe('Vial', out_f[:-1] + in_f[1:], closed=False)
    vial.data.materials.append(glass)
    lp = fillet([(0.0, 0.085), (Rin - .003, 0.085), (Rin - .003, 1.0), (0.0, 1.0)], [0, .09, 0, 0], 8)
    liq = lathe('Liquid', lp, closed=False)
    liq.data.materials.append(liquid)
    cork = lathe('Cork', fillet([(0.0, 1.05), (Rin + .005, 1.05), (Rin + .02, 1.52), (0.0, 1.52)], [0, .01, .05, 0], 6), closed=False)
    cork.data.materials.append(wood)

# backdrop sweep (not for transparent modes)
if MODE in ('empty', 'full'):
    bpy.ops.mesh.primitive_plane_add(size=1)
    bd = bpy.context.object
    bm = bmesh.new(); bm.from_mesh(bd.data)
    bm.free()
    # build a sweep from a profile
    me = bpy.data.meshes.new('Sweep')
    bm = bmesh.new()
    prof = []
    for i in range(0, 41):
        t = i / 40
        if t < .5:
            prof.append((-8 + t * 2 * 8, 0.0))  # floor from y=-8 to 0 ... (y, z)
    ys = [(-20 + i * .5, 0.0) for i in range(0, 45)]  # floor -10..2
    arc = [(2 + 2.5 * math.sin(a), 2.5 - 2.5 * math.cos(a)) for a in [k * (math.pi / 2) / 16 for k in range(1, 17)]]
    wall = [(4.5, 2.5 + i * .5) for i in range(1, 30)]
    prof = ys + arc + wall
    rows = []
    for x in (-12, 12):
        rows.append([bm.verts.new((x, y, z)) for y, z in prof])
    for i in range(len(prof) - 1):
        bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
    bm.to_mesh(me); bm.free()
    sweep = bpy.data.objects.new('Sweep', me)
    scn.collection.objects.link(sweep)
    for p in me.polygons: p.use_smooth = True
    sweep.data.materials.append(backdrop_m)
    bpy.data.objects.remove(bd)

# ---------- lights: big soft key, two tall strip softboxes for glass streaks, rim
def area(name, loc, rot, size, energy, shape='RECTANGLE', sy=None, color=(1, .96, .9)):
    l = bpy.data.lights.new(name, 'AREA')
    l.shape = shape; l.size = size; l.energy = energy; l.color = color
    if sy: l.size_y = sy
    o = bpy.data.objects.new(name, l); scn.collection.objects.link(o)
    o.location = loc; o.rotation_euler = rot
    return o


def look(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


k = 1.0 if MODE != 'vial' else 0.35
key = area('Key', (-4.5, -4.5, 4.5), (0, 0, 0), 4.0, 900 * k); look(key, (0, 0, 1.4))
fill = area('Fill', (5, -3.5, 2.5), (0, 0, 0), 5.0, 260 * k, color=(1, .92, .85)); look(fill, (0, 0, 1.4))
rim = area('Rim', (3.0, 1.5, 3.2), (0, 0, 0), 2.0, 500 * k); look(rim, (0, 0, 1.6))
top = area('Top', (0, 0, 7), (0, 0, 0), 3.0, 300 * k); look(top, (0, 0, 0))

# visible-in-reflection strip softboxes (emissive planes, invisible to camera)
for nm, x, st in (('StripL', -2.6, 14.0), ('StripR', 2.9, 7.0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, -3.2, 1.6))
    sp = bpy.context.object; sp.name = nm
    sp.scale = (0.45, 4.2, 1); look(sp, (0, 0, 1.6))
    sp.rotation_euler.rotate_axis('Z', 0)
    sp.data.materials.append(emissive(nm + 'M', st * (1 if MODE != 'vial' else .6)))
    sp.visible_camera = False
    sp.visible_shadow = False

for nm, x in (('FlagL', -3.2), ('FlagR', 3.2)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(x, 0.8, 1.6))
    fp = bpy.context.object; fp.name = nm
    fp.scale = (1.2, 5.0, 1); look(fp, (0, 0, 1.6))
    fm = bpy.data.materials.new(nm + 'M'); fm.use_nodes = True
    fm.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.02, 0.012, 0.008, 1)
    fm.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 1.0
    fp.data.materials.append(fm)
    fp.visible_camera = False
    fp.visible_shadow = False
world = bpy.data.worlds.new('W'); scn.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.93, 0.82, 0.72, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9

# ---------- camera
cam_d = bpy.data.cameras.new('Cam')
cam = bpy.data.objects.new('Cam', cam_d); scn.collection.objects.link(cam)
scn.camera = cam
if MODE != 'vial':
    cam_d.lens = 100
    cam.location = (0, -15.5, 1.8)
    look(cam, (0, 0, 1.62))
else:
    cam_d.lens = 100
    cam.location = (0, -6.0, 0.95)
    look(cam, (0, 0, 0.72))

bpy.context.view_layer.update()


def px(pt):
    v = world_to_camera_view(scn, cam, Vector(pt))
    return [round(v.x * W, 1), round((1 - v.y) * H, 1)]


if MODE != 'vial':
    info = {
        'liq_bottom': px((0, -Rin, LIQ_BOTTOM)), 'liq_top': px((0, -Rin, LIQ_TOP)),
        'liq_left': px((-Rin, 0, 1.2)), 'liq_right': px((Rin, 0, 1.2)),
        'body_left': px((-R, 0, 1.2)), 'body_right': px((R, 0, 1.2)),
        'neck_top': px((0, -0.38, 3.0)), 'neck_l': px((-0.29, 0, 3.0)), 'neck_r': px((0.29, 0, 3.0)),
        'cap_top': px((0, -0.56, 3.48)), 'base': px((0, -R, 0)),
        'label_top': px((0, -R, 1.75)), 'label_bottom': px((0, -R, 0.95)),
    }
    json.dump(info, open(OUT + '.json', 'w'), indent=1)

scn.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('done', MODE)

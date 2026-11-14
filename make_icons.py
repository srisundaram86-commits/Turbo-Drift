import zlib
import struct
import math

def create_png(width, height, get_pixel_func):
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0) # Filter byte: None
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_rows.extend([int(r), int(g), int(b), int(a)])
    
    compressed = zlib.compress(bytes(raw_rows), level=9)
    
    def make_chunk(chunk_type, data):
        length = struct.pack('>I', len(data))
        crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(make_chunk(b'IHDR', ihdr_data))
    png.extend(make_chunk(b'IDAT', compressed))
    png.extend(make_chunk(b'IEND', b''))
    return bytes(png)

def icon_shader(x, y, w, h):
    # Normalized coords (-1 to 1)
    nx = (x / w) * 2 - 1
    ny = (y / h) * 2 - 1
    dist = math.sqrt(nx*nx + ny*ny)
    
    # Rounded badge background
    corner_box = max(abs(nx), abs(ny))
    if corner_box > 0.92:
        return 0, 0, 0, 0
    
    # Deep Cyberpunk Dark Radial Gradient
    bg_t = min(1.0, dist * 0.9)
    r = int(12 + (30 - 12) * bg_t)
    g = int(16 + (10 - 16) * bg_t)
    b = int(30 + (45 - 30) * bg_t)
    a = 255
    
    # Glowing neon cyan road grid lines
    if abs(ny - 0.45) < 0.03: # Horizon
        return 255, 0, 85, 255
    if ny > 0.45:
        # Receding road perspective
        lane_x = nx / (ny - 0.3)
        if abs(lane_x) < 0.7:
            # Asphalt
            r, g, b = 25, 30, 48
            if abs(lane_x) < 0.05 and int((ny * 25)) % 2 == 0:
                return 255, 255, 255, 255 # center dash
            if abs(abs(lane_x) - 0.65) < 0.08:
                return 0, 243, 255, 255 # curb
    
    # 3D Supercar silhouette in center
    cx = nx * 1.8
    cy = (ny - 0.15) * 1.8
    if abs(cx) < 0.32 and abs(cy) < 0.55:
        # Car body
        if abs(cx) < 0.28 and abs(cy) < 0.45:
            # Cockpit / Roof
            if abs(cy) < 0.2:
                return 0, 243, 255, 255 # Neon cyan roof
            else:
                return 10, 180, 255, 255
        # Taillights
        if cy > 0.38 and abs(cx) > 0.12:
            return 255, 0, 85, 255 # Neon red taillight
        return 0, 200, 255, 255
    
    # Neon border frame
    if corner_box > 0.86:
        return 0, 243, 255, 255

    return r, g, b, a

print("Generating Android App Icons...")
with open("icon-192.png", "wb") as f:
    f.write(create_png(192, 192, icon_shader))
print("Created icon-192.png")

with open("icon-512.png", "wb") as f:
    f.write(create_png(512, 512, icon_shader))
print("Created icon-512.png")

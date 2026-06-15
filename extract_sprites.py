import sys

def parse_bmp():
    with open("spritesheet.bmp", "rb") as f:
        data = f.read()
    
    pixel_offset = int.from_bytes(data[10:14], "little")
    raw_width = int.from_bytes(data[18:22], "little")
    raw_height = int.from_bytes(data[22:26], "little")
    
    # Handle negative height (indicates top-to-bottom BMP format)
    width = raw_width
    height = raw_height
    top_to_bottom = False
    if height > 2**31:
        height = 2**32 - height
        top_to_bottom = True
        
    bpp = int.from_bytes(data[28:30], "little")
    
    print(f"Width: {width}, Height: {height}, BPP: {bpp}, Offset: {pixel_offset}, Top-to-Bottom: {top_to_bottom}")
    
    bytes_per_pixel = bpp // 8
    # row size is padded to a multiple of 4 bytes
    row_size = ((width * bpp + 31) // 32) * 4
    
    def get_pixel(x, y):
        # If top_to_bottom is True, BMP row index is just y
        # Otherwise, BMP row index is height - 1 - y
        y_bmp = y if top_to_bottom else (height - 1 - y)
        pixel_idx = pixel_offset + y_bmp * row_size + x * bytes_per_pixel
        
        if pixel_idx >= len(data):
            return (0, 0, 0, 0)
            
        b = data[pixel_idx]
        g = data[pixel_idx+1]
        r = data[pixel_idx+2]
        if bytes_per_pixel == 4:
            a = data[pixel_idx+3]
            return (r, g, b, a)
        return (r, g, b, 255)

    colors = set()
    for y in range(2, 49):
        for x in range(848, 892):
            colors.add(get_pixel(x, y))
    print("Colors in T-Rex region:", list(colors)[:10])

if __name__ == "__main__":
    parse_bmp()

import os
import shutil
from PIL import Image, ImageEnhance

os.makedirs('public/media', exist_ok=True)

# 1. Process Logo: img_p1_0_1222x1222.png
# Let's inspect logo and remove pure black background
logo_src = 'extracted_assets/img_p1_0_1222x1222.png'
if os.path.exists(logo_src):
    logo = Image.open(logo_src).convert('RGBA')
    datas = logo.getdata()
    new_data = []
    for item in datas:
        # If very dark (near black background), make transparent
        r, g, b, a = item
        if r < 18 and g < 18 and b < 18:
            new_data.append((0, 0, 0, 0))
        elif r < 40 and g < 40 and b < 40:
            alpha = int(((max(r, g, b) - 18) / 22) * 255)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)
    logo.putdata(new_data)
    # Crop to non-transparent bbox
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    logo.save('public/media/logo_transparent.png', 'PNG')
    # Also save original high-res logo with black background
    shutil.copyfile(logo_src, 'public/media/logo_original.png')
    print('Logo processed successfully!')

# 2. Copy hero video and poster
if os.path.exists('hero-video-h264.mp4'):
    shutil.copyfile('hero-video-h264.mp4', 'public/media/hero-video.mp4')
    print('Hero video copied!')
if os.path.exists('hero-poster.jpg'):
    shutil.copyfile('hero-poster.jpg', 'public/media/hero-poster.jpg')
    print('Hero poster copied!')

# 3. Crop workshop and training photos from page_1 and page_4
# Page 1: 9 photos grid
p1 = Image.open('extracted_assets/page_1.png')
# Let's inspect where the grid is located on page 1
# Page is 1655 x 2340
# The 9-grid is approx: x: 260 to 1395 (w: 1135), y: 880 to 1750 (h: 870)
# Let's crop individual photos from the grid
grid_x = 265
grid_y = 878
grid_w = 1125
grid_h = 848
col_w = grid_w / 3.0
row_h = grid_h / 3.0

photos_p1 = [
    'action_polishing_hood.jpg',
    'action_foam_wash.jpg',
    'action_applicator.jpg',
    'action_student_polishing_side.jpg',
    'action_van_workshop.jpg',
    'action_bmw_polishing.jpg',
    'action_door_wipe.jpg',
    'action_headlight_restoration.jpg',
    'action_graduation_students.jpg'
]

idx = 0
for r in range(3):
    for c in range(3):
        box = (
            int(grid_x + c * col_w + 4),
            int(grid_y + r * row_h + 4),
            int(grid_x + (c + 1) * col_w - 4),
            int(grid_y + (r + 1) * row_h - 4)
        )
        crop_img = p1.crop(box)
        filename = f'public/media/{photos_p1[idx]}'
        crop_img.save(filename, 'JPEG', quality=95)
        print(f'Cropped {filename}')
        idx += 1

# Page 4: central grid with Mauro and van
p4 = Image.open('extracted_assets/page_4.png')
# Central grid is approx x: 440 to 1250, y: 1040 to 1830
grid4_x = 440
grid4_y = 1040
grid4_w = 810
grid4_h = 790
crop_p4_grid = p4.crop((grid4_x, grid4_y, grid4_x + grid4_w, grid4_y + grid4_h))
crop_p4_grid.save('public/media/experience_grid.jpg', 'JPEG', quality=95)
print('Cropped experience_grid.jpg')

# Also individual photos from page 4:
# Mauro at computer:
p4.crop((445, 1045, 710, 1270)).save('public/media/mauro_office.jpg', 'JPEG', quality=95)
# Mauro center photo:
p4.crop((715, 1045, 980, 1270)).save('public/media/mauro_portrait.jpg', 'JPEG', quality=95)
# Van interior equipment:
p4.crop((445, 1275, 710, 1515)).save('public/media/mobile_van_interior.jpg', 'JPEG', quality=95)
# Polished VW Nivus / Taos front:
p4.crop((715, 1275, 1245, 1630)).save('public/media/polished_front_mirror.jpg', 'JPEG', quality=95)
# Mobile van exterior:
p4.crop((985, 1635, 1245, 1830)).save('public/media/mobile_van_action.jpg', 'JPEG', quality=95)
print('Page 4 sub-photos cropped successfully!')


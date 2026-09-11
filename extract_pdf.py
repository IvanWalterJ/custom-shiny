import fitz
import os

pdf_path = r'C:\Users\Ivan Walter\Desktop\CUSTOM SHINY FORMACION.pdf'
output_dir = 'extracted_assets'
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print('Pages count:', len(doc))

count = 0
for page_idx, page in enumerate(doc):
    pix = page.get_pixmap(dpi=200)
    page_filename = os.path.join(output_dir, f'page_{page_idx+1}.png')
    pix.save(page_filename)
    print(f'Saved full page: {page_filename}')

    image_list = page.get_images(full=True)
    for img_idx, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image['image']
        image_ext = base_image['ext']
        w = base_image['width']
        h = base_image['height']
        filename = os.path.join(output_dir, f'img_p{page_idx+1}_{img_idx}_{w}x{h}.{image_ext}')
        with open(filename, 'wb') as f:
            f.write(image_bytes)
        count += 1
        print(f'Saved image: {filename} ({w}x{h})')

print(f'Total extracted: {count} images and {len(doc)} pages.')

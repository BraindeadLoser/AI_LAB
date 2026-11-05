import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Initialize Presentation
prs = Presentation()

# Set standard 16:9 widescreen dimensions
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Color Palette
DARK_NAVY = RGBColor(24, 43, 73)
TEAL_ACCENT = RGBColor(0, 150, 136)
TEXT_DARK = RGBColor(40, 40, 40)
MUTED_TEXT = RGBColor(80, 80, 80)

slide_layout = prs.slide_layouts[6]  # Blank layout

# -------------------------------------------------------------
# SLIDE 1: Title Slide
# -------------------------------------------------------------
slide1 = prs.slides.add_slide(slide_layout)

title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(2.5), Inches(11.333), Inches(2.5))
tf1 = title_box.text_frame
tf1.word_wrap = True

p1 = tf1.paragraphs[0]
p1.text = "Polynomial Equations & Roots"
p1.font.size = Pt(44)
p1.font.bold = True
p1.font.color.rgb = DARK_NAVY
p1.alignment = PP_ALIGN.LEFT

p2 = tf1.add_paragraph()
p2.text = "Topic 3: Relation Between Roots and Coefficients (Vieta's Formulas)"
p2.font.size = Pt(20)
p2.font.color.rgb = TEAL_ACCENT
p2.space_before = Pt(15)

# -------------------------------------------------------------
# SLIDE 2: Topic 3 - Relation Between Roots and Coefficients
# -------------------------------------------------------------
slide2 = prs.slides.add_slide(slide_layout)

# Slide Header
header_box = slide2.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.0))
tf2_header = header_box.text_frame
tf2_header.word_wrap = True

p_head = tf2_header.paragraphs[0]
p_head.text = "3. Relation Between Roots and Coefficients (Vieta's Formulas)"
p_head.font.size = Pt(28)
p_head.font.bold = True
p_head.font.color.rgb = DARK_NAVY

# -------------------------------------------------------------
# Left Column: Concept & General Formulas (CLEANED & FORMATTED)
# -------------------------------------------------------------
left_box = slide2.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
tf_left = left_box.text_frame
tf_left.word_wrap = True

# Title
p_def_title = tf_left.paragraphs[0]
p_def_title.text = "Concept & General Formulas"
p_def_title.font.size = Pt(20)
p_def_title.font.bold = True
p_def_title.font.color.rgb = TEAL_ACCENT

# Intro text
p_intro = tf_left.add_paragraph()
p_intro.text = "Vieta's formulas link polynomial roots directly to its coefficients."
p_intro.font.size = Pt(13)
p_intro.font.color.rgb = TEXT_DARK
p_intro.space_before = Pt(8)

# Polynomial equation definition
p_eq = tf_left.add_paragraph()
p_eq.text = "For P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₀ = 0 with roots r₁, r₂, ..., rₙ:"
p_eq.font.size = Pt(13)
p_eq.font.italic = True
p_eq.font.color.rgb = TEXT_DARK
p_eq.space_before = Pt(6)

# Bullet 1: Sum of roots
p_b1 = tf_left.add_paragraph()
p_b1.text = "• Sum of roots (1 at a time):"
p_b1.font.size = Pt(13)
p_b1.font.bold = True
p_b1.font.color.rgb = DARK_NAVY
p_b1.space_before = Pt(10)

p_f1 = tf_left.add_paragraph()
p_f1.text = "   ∑ rᵢ = − ( aₙ₋₁ / aₙ )"
p_f1.font.size = Pt(13)
p_f1.font.color.rgb = TEXT_DARK
p_f1.space_before = Pt(2)

# Bullet 2: Sum of pairwise products
p_b2 = tf_left.add_paragraph()
p_b2.text = "• Sum of pairwise products (2 at a time):"
p_b2.font.size = Pt(13)
p_b2.font.bold = True
p_b2.font.color.rgb = DARK_NAVY
p_b2.space_before = Pt(8)

p_f2 = tf_left.add_paragraph()
p_f2.text = "   ∑ rᵢ rⱼ = aₙ₋₂ / aₙ"
p_f2.font.size = Pt(13)
p_f2.font.color.rgb = TEXT_DARK
p_f2.space_before = Pt(2)

# Bullet 3: Product of all roots
p_b3 = tf_left.add_paragraph()
p_b3.text = "• Product of all roots (n at a time):"
p_b3.font.size = Pt(13)
p_b3.font.bold = True
p_b3.font.color.rgb = DARK_NAVY
p_b3.space_before = Pt(8)

p_f3 = tf_left.add_paragraph()
p_f3.text = "   ∏ rᵢ = (−1)ⁿ · ( a₀ / aₙ )"
p_f3.font.size = Pt(13)
p_f3.font.color.rgb = TEXT_DARK
p_f3.space_before = Pt(2)


# -------------------------------------------------------------
# Right Column: Worked Examples
# -------------------------------------------------------------
right_box = slide2.shapes.add_textbox(Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
tf_right = right_box.text_frame
tf_right.word_wrap = True

p_ex_title = tf_right.paragraphs[0]
p_ex_title.text = "Worked Examples"
p_ex_title.font.size = Pt(20)
p_ex_title.font.bold = True
p_ex_title.font.color.rgb = TEAL_ACCENT

p_ex1 = tf_right.add_paragraph()
p_ex1.text = "Example 1: Quadratic Equation"
p_ex1.font.size = Pt(15)
p_ex1.font.bold = True
p_ex1.font.color.rgb = DARK_NAVY
p_ex1.space_before = Pt(8)

p_ex1_body = tf_right.add_paragraph()
p_ex1_body.text = (
    "Equation: 2x² - 8x + 6 = 0 (a=2, b=-8, c=6)\n"
    "• Sum: -(-8)/2 = 4  |  Product: 6/2 = 3\n"
    "• Verification: Roots are 1 and 3 (1+3=4, 1×3=3)."
)
p_ex1_body.font.size = Pt(13)
p_ex1_body.font.color.rgb = TEXT_DARK

p_ex2 = tf_right.add_paragraph()
p_ex2.text = "Example 2: Cubic Equation"
p_ex2.font.size = Pt(15)
p_ex2.font.bold = True
p_ex2.font.color.rgb = DARK_NAVY
p_ex2.space_before = Pt(14)

p_ex2_body = tf_right.add_paragraph()
p_ex2_body.text = (
    "Equation: x³ - 6x² + 11x - 6 = 0\n"
    "• Sum: -(-6)/1 = 6\n"
    "• Product: -(-6)/1 = 6\n"
    "• Verification: Roots are 1, 2, 3 (Sum=6, Prod=6)."
)
p_ex2_body.font.size = Pt(13)
p_ex2_body.font.color.rgb = TEXT_DARK

# Save presentation
output_path = os.path.join(os.getcwd(), "Algebra_Assignment_Topic3.pptx")
prs.save(output_path)
print(f"Presentation generated successfully at: {output_path}")
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
MUTED_TEXT = RGBColor(100, 100, 100)

slide_layout = prs.slide_layouts[6]  # Blank layout

# -------------------------------------------------------------
# INTRODUCTORY SLIDE (Slide 1)
# -------------------------------------------------------------
slide_intro = prs.slides.add_slide(slide_layout)

# 1. Top Header Box: College & Course Info
top_box = slide_intro.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.333), Inches(1.2))
tf_top = top_box.text_frame
tf_top.word_wrap = True

p_college = tf_top.paragraphs[0]
p_college.text = "Atma Ram Sanatan Dharma College, University of Delhi"
p_college.font.size = Pt(18)
p_college.font.bold = True
p_college.font.color.rgb = TEAL_ACCENT

p_course = tf_top.add_paragraph()
p_course.text = "B.Sc. Mathematics (Hons)   |   Subject: Algebra"
p_course.font.size = Pt(14)
p_course.font.color.rgb = MUTED_TEXT
p_course.space_before = Pt(4)

# 2. Center Box: Main Presentation Title
center_box = slide_intro.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(11.333), Inches(2.2))
tf_center = center_box.text_frame
tf_center.word_wrap = True

p_main_title = tf_center.paragraphs[0]
p_main_title.text = "Polynomial Equations & Roots"
p_main_title.font.size = Pt(40)
p_main_title.font.bold = True
p_main_title.font.color.rgb = DARK_NAVY

p_sub_title = tf_center.add_paragraph()
p_sub_title.text = "Topics: Multiple Roots, Fundamental Theorem of Algebra, & Vieta's Formulas"
p_sub_title.font.size = Pt(18)
p_sub_title.font.color.rgb = TEXT_DARK
p_sub_title.space_before = Pt(10)

# 3. Bottom Footer Box: Team Members & Roll Numbers
team_box = slide_intro.shapes.add_textbox(Inches(1.0), Inches(4.8), Inches(11.333), Inches(2.0))
tf_team = team_box.text_frame
tf_team.word_wrap = True

p_team_heading = tf_team.paragraphs[0]
p_team_heading.text = "Presented by:"
p_team_heading.font.size = Pt(15)
p_team_heading.font.bold = True
p_team_heading.font.color.rgb = DARK_NAVY

members = [
    "Hardik Singh (26/67037)",
    "Happy Chaudhary (26/67035)",
    "Harvinder Singh (26/67041)",
    "Jai (26/67043)",
    "Kavya Panwar (26/67051)"
]

for member in members:
    p_member = tf_team.add_paragraph()
    p_member.text = f"•  {member}"
    p_member.font.size = Pt(13)
    p_member.font.color.rgb = TEXT_DARK
    p_member.space_before = Pt(3)

# Save presentation
output_path = os.path.join(os.getcwd(), "Algebra_Intro_Slide.pptx")
prs.save(output_path)
print(f"Introductory slide presentation generated successfully at: {output_path}")
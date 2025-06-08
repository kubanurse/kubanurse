# backend/app/views/report.py
import io
from flask import Blueprint, request, send_file, abort
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from app.extensions import db
from app.models import Patient, AllergyAddiction, Examination, JointAssessment, Das28Result

report_bp = Blueprint('report', __name__, url_prefix='/api/report')

@report_bp.route('/<int:patient_id>', methods=['GET'])
def generate_report(patient_id):
    # 1) Fetch records
    patient = Patient.query.get_or_404(patient_id)
    allergies = AllergyAddiction.query.filter_by(patient_id=patient_id).all()
    exam      = Examination.query.filter_by(patient_id=patient_id).order_by(Examination.id.desc()).first()
    joints    = JointAssessment.query.filter_by(patient_id=patient_id).all()
    das28     = Das28Result.query.filter_by(patient_id=patient_id).order_by(Das28Result.id.desc()).first()

    # 2) Build PDF in memory
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 50

    # Header
    c.setFont('Helvetica-Bold', 16)
    c.drawString(50, y, f'Patient Report: {patient.first_name} {patient.last_name}')
    y -= 30

    c.setFont('Helvetica', 12)
    # Phase 1
    c.drawString(50, y, f'DOB: {patient.dob.strftime("%Y-%m-%d")}    Gender: {patient.gender}')
    y -= 20

    # Phase 2
    c.drawString(50, y, 'Allergies & Addictions:')
    y -= 16
    for a in allergies:
        c.drawString(70, y, f'- {a.type}: {a.description}')
        y -= 14

    # Phase 3
    y -= 10
    c.drawString(50, y, 'General Examination Notes:')
    y -= 16
    text = c.beginText(70, y)
    text.setFont('Helvetica', 11)
    for line in (exam.notes or '').split('\n'):
        text.textLine(line)
    c.drawText(text)
    y = text.getY() - 10

    # Phase 4
    c.drawString(50, y, 'Joint Assessment:')
    y -= 16
    for j in joints:
        status = []
        if j.is_swollen: status.append('Swollen')
        if j.is_tender:  status.append('Tender')
        c.drawString(70, y, f'- {j.joint_name}: {", ".join(status) or "Normal"}')
        y -= 14

    # Phase 5
    y -= 10
    c.drawString(50, y, 'DAS28 Result:')
    y -= 16
    c.drawString(70, y, f'Tender count: {das28.tender_count}')
    y -= 14
    c.drawString(70, y, f'Swollen count: {das28.swollen_count}')
    y -= 14
    c.drawString(70, y, f'ESR/CRP: {das28.esr_value}')
    y -= 14
    c.drawString(70, y, f'Global assessment: {das28.global_assessment}')
    y -= 14
    c.drawString(70, y, f'Calculated DAS28 score: {das28.score:.2f}')

    c.showPage()
    c.save()
    buffer.seek(0)

    # 3) Send as file download
    return send_file(buffer,
                     as_attachment=True,
                     download_name=f'Patient_{patient_id}_Report.pdf',
                     mimetype='application/pdf')

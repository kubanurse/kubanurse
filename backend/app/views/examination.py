from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Examination, Patient

exam_bp = Blueprint('exam_bp', __name__)

@exam_bp.route('/', methods=['POST'])
def save_examination():
    data = request.get_json() or {}
    pid = data.get('patient_id')
    notes = data.get('notes')  # transcript text

    if not pid or notes is None:
        return jsonify({'error': 'patient_id and notes required'}), 400

    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    exam = Examination(patient_id=pid, notes=notes)
    db.session.add(exam)
    db.session.commit()

    return jsonify({'examination_id': exam.id}), 201

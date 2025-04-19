from flask import Blueprint, request, jsonify
import math
from ..extensions import db
from ..models import Das28Result, Patient

das28_bp = Blueprint('das28_bp', __name__)

@das28_bp.route('/', methods=['POST'])
def calculate_das28():
    data = request.get_json() or {}
    pid   = data.get('patient_id')
    tender = data.get('tender_count')
    swollen = data.get('swollen_count')
    esr     = data.get('esr_value')
    global_assess = data.get('global_assessment')

    # Validate
    if None in (pid, tender, swollen, esr, global_assess):
        return jsonify({'error': 'Missing parameters'}), 400
    if tender < 0 or swollen < 0 or esr <= 0:
        return jsonify({'error': 'Invalid numeric values'}), 400

    # DAS28 formula
    score = (
        0.56 * math.sqrt(tender) +
        0.28 * math.sqrt(swollen) +
        0.70 * math.log(esr) +
        0.014 * global_assess
    )

    patient = Patient.query.get(pid)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    result = Das28Result(
        patient_id=pid,
        tender_count=tender,
        swollen_count=swollen,
        esr_value=esr,
        global_assessment=global_assess,
        score=score
    )
    db.session.add(result)
    db.session.commit()

    return jsonify({'das28_score': score}), 200

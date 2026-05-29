import { checkAuthAndRedirect, logout, getCurrentUser } from './auth.js';
import { 
    registerPatient, 
    getPatients, 
    addConsultationToPatient, 
    getPatientById,
    deleteAllPatients,
    deletePatientById,
    editConsultation
} from './patients.js';
import { renderPatientHistory } from './consultations.js';

// 1. Security Gate
const user = checkAuthAndRedirect();
if (user) document.getElementById('currentUser').innerText = `👩‍⚕️ ${user}`;

// 2. Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
});

// 3. DOM Elements
const patientSelect = document.getElementById('patientSelect');
const consultationArea = document.getElementById('consultationArea');
const historyContainer = document.getElementById('historyList');
let selectedPatientId = null;

// Modal elements
const modal = document.getElementById('editModal');
const closeModal = document.getElementsByClassName('close')[0];
const saveEditBtn = document.getElementById('saveEditBtn');
let currentEditData = null;

// 4. Load Patient Directory
function loadPatientDropdown() {
    const patients = getPatients();
    patientSelect.innerHTML = '<option value="">-- Selecciona un paciente --</option>';
    patients.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = `${p.name} (${p.diagnosis}) - IMC: ${p.imc}`;
        patientSelect.appendChild(option);
    });
}

// 5. Función para actualizar historial
function updateHistory() {
    if (selectedPatientId) {
        renderPatientHistory(selectedPatientId, historyContainer, (patientId, consultation) => {
            // Abrir modal para editar
            currentEditData = {
                patientId: patientId,
                consultationId: consultation.id,
                evolution: consultation.evolution,
                dietPlan: consultation.dietPlan,
                dateTime: consultation.rawDateTime || new Date(consultation.timestamp).toISOString().slice(0, 16)
            };
            
            document.getElementById('editEvolucion').value = currentEditData.evolution;
            document.getElementById('editPlanDieta').value = currentEditData.dietPlan;
            document.getElementById('editFechaHora').value = currentEditData.dateTime;
            modal.style.display = 'block';
        });
    }
}

// 6. When patient selected
patientSelect.addEventListener('change', (e) => {
    const id = parseInt(e.target.value);
    if (id) {
        selectedPatientId = id;
        consultationArea.style.display = 'block';
        updateHistory();
    } else {
        selectedPatientId = null;
        consultationArea.style.display = 'none';
        historyContainer.innerHTML = '<p class="placeholder">Selecciona un paciente para ver su historial</p>';
    }
});

// 7. Register new patient
document.getElementById('registerPatientForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('patName').value;
    const age = document.getElementById('patAge').value;
    const weight = document.getElementById('patWeight').value;
    const height = document.getElementById('patHeight').value;
    
    if (!name || !age || !weight || !height) {
        alert('Todos los campos son obligatorios');
        return;
    }
    
    const newPatient = registerPatient(name, age, weight, height);
    if (newPatient) {
        document.getElementById('imcResult').innerHTML = ` ${newPatient.name} | IMC: ${newPatient.imc} (${newPatient.diagnosis})`;
        document.getElementById('registerPatientForm').reset();
        loadPatientDropdown();
        
        setTimeout(() => {
            patientSelect.value = newPatient.id;
            patientSelect.dispatchEvent(new Event('change'));
        }, 100);
        
        setTimeout(() => {
            document.getElementById('imcResult').innerHTML = '';
        }, 3000);
    }
});

// 8. Save Consultation with custom date/time
document.getElementById('saveConsultationBtn').addEventListener('click', () => {
    if (!selectedPatientId) {
        alert('Por favor, selecciona un paciente primero');
        return;
    }
    
    const evolution = document.getElementById('evolucion').value.trim();
    const planDieta = document.getElementById('planDieta').value.trim();
    const fechaHora = document.getElementById('consultaFechaHora').value;
    
    if (!evolution || !planDieta) {
        alert('Completa evolución y plan de alimentación');
        return;
    }
    
    if (!fechaHora) {
        alert('Por favor, selecciona fecha y hora para la consulta');
        return;
    }
    
    const success = addConsultationToPatient(selectedPatientId, evolution, planDieta, fechaHora);
    if (success) {
        document.getElementById('evolucion').value = '';
        document.getElementById('planDieta').value = '';
        document.getElementById('consultaFechaHora').value = '';
        updateHistory();
        loadPatientDropdown();
        alert(' Consulta guardada exitosamente');
    } else {
        alert(' Error al guardar la consulta');
    }
});

// 9. Delete all patients
document.getElementById('clearAllPatientsBtn').addEventListener('click', () => {
    if (deleteAllPatients()) {
        loadPatientDropdown();
        selectedPatientId = null;
        consultationArea.style.display = 'none';
        historyContainer.innerHTML = '<p class="placeholder">Selecciona un paciente para ver su historial</p>';
        alert(' Todos los pacientes han sido eliminados');
    }
});

// 10. Delete selected patient
document.getElementById('deleteSelectedPatientBtn').addEventListener('click', () => {
    if (!selectedPatientId) {
        alert('Por favor, selecciona un paciente primero');
        return;
    }
    
    if (deletePatientById(selectedPatientId)) {
        loadPatientDropdown();
        selectedPatientId = null;
        consultationArea.style.display = 'none';
        historyContainer.innerHTML = '<p class="placeholder">Selecciona un paciente para ver su historial</p>';
        alert(' Paciente eliminado exitosamente');
    }
});

// 11. Save edited consultation
saveEditBtn.addEventListener('click', () => {
    if (!currentEditData) return;
    
    const newEvolution = document.getElementById('editEvolucion').value.trim();
    const newDietPlan = document.getElementById('editPlanDieta').value.trim();
    const newDateTime = document.getElementById('editFechaHora').value;
    
    if (!newEvolution || !newDietPlan) {
        alert('Completa todos los campos');
        return;
    }
    
    if (!newDateTime) {
        alert('Selecciona fecha y hora');
        return;
    }
    
    const success = editConsultation(
        currentEditData.patientId,
        currentEditData.consultationId,
        newEvolution,
        newDietPlan,
        newDateTime
    );
    
    if (success) {
        modal.style.display = 'none';
        updateHistory();
        loadPatientDropdown();
        alert(' Consulta actualizada exitosamente');
    } else {
        alert(' Error al actualizar la consulta');
    }
});

// 12. Close modal
closeModal.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Set default datetime value to now
function setDefaultDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const defaultDateTime = now.toISOString().slice(0, 16);
    document.getElementById('consultaFechaHora').value = defaultDateTime;
}

// Initial load
loadPatientDropdown();
setDefaultDateTime();
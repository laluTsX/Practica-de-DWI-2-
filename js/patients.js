const PATIENTS_KEY = 'nutrix_patients';

export function getPatients() {
    const data = localStorage.getItem(PATIENTS_KEY);
    return data ? JSON.parse(data) : [];
}

export function savePatients(patients) {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function registerPatient(name, age, weight, height) {
    const patients = getPatients();
    const exists = patients.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('⚠️ Este paciente ya está registrado');
        return null;
    }
    
    const imc = weight / (height * height);
    let diagnosis = '';
    if (imc < 18.5) diagnosis = 'Bajo Peso';
    else if (imc < 25) diagnosis = 'Peso Normal';
    else if (imc < 30) diagnosis = 'Sobrepeso';
    else diagnosis = 'Obesidad';
    
    const newPatient = {
        id: Date.now(),
        name: name.trim(),
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        imc: imc.toFixed(2),
        diagnosis,
        createdAt: new Date().toISOString(),
        consultations: []  
    };
    
    patients.push(newPatient);
    savePatients(patients);
    return newPatient;
}

export function getPatientById(id) {
    const patients = getPatients();
    return patients.find(p => p.id === id);
}

// Eliminar todos los pacientes
export function deleteAllPatients() {
    if (confirm('⚠️ ¿Estas seguro de que quieres ELIMINAR TODOS los pacientes? Esta acción no se puede deshacer.')) {
        savePatients([]);
        return true;
    }
    return false;
}

// Eliminar un paciente específico
export function deletePatientById(patientId) {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar este paciente y todo su historial?')) {
        const patients = getPatients();
        const filteredPatients = patients.filter(p => p.id !== patientId);
        savePatients(filteredPatients);
        return true;
    }
    return false;
}

// Agregar consulta con fecha personalizada
export function addConsultationToPatient(patientId, evolution, dietPlan, customDateTime = null) {
    const patients = getPatients();
    const index = patients.findIndex(p => p.id === patientId);
    if (index === -1) return false;
    
    let consultationDate;
    let timestamp;
    
    if (customDateTime) {
        // Usar la fecha personalizada
        const date = new Date(customDateTime);
        consultationDate = date.toLocaleString('es-ES');
        timestamp = date.getTime();
    } else {
        // Usar fecha actual
        consultationDate = new Date().toLocaleString('es-ES');
        timestamp = Date.now();
    }
    
    const consultation = {
        id: Date.now(),
        date: consultationDate,
        timestamp: timestamp,
        evolution: evolution.trim(),
        dietPlan: dietPlan.trim(),
        rawDateTime: customDateTime 
    };
    
    if (!patients[index].consultations) patients[index].consultations = [];
    patients[index].consultations.unshift(consultation);
    savePatients(patients);
    return true;
}

// Editar consulta existente
export function editConsultation(patientId, consultationId, newEvolution, newDietPlan, newDateTime) {
    const patients = getPatients();
    const patientIndex = patients.findIndex(p => p.id === patientId);
    if (patientIndex === -1) return false;
    
    const consultationIndex = patients[patientIndex].consultations.findIndex(c => c.id === consultationId);
    if (consultationIndex === -1) return false;
    
    const date = new Date(newDateTime);
    
    patients[patientIndex].consultations[consultationIndex].evolution = newEvolution.trim();
    patients[patientIndex].consultations[consultationIndex].dietPlan = newDietPlan.trim();
    patients[patientIndex].consultations[consultationIndex].date = date.toLocaleString('es-ES');
    patients[patientIndex].consultations[consultationIndex].timestamp = date.getTime();
    patients[patientIndex].consultations[consultationIndex].rawDateTime = newDateTime;
    
    savePatients(patients);
    return true;
}
import React, { useState } from 'react';

const ErrorDiagnostics = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const testAPIs = async () => {
    setTesting(true);
    setLogs([]);
    
    try {
      addLog('Starting API diagnostics...', 'info');
      
      // Test 1: Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        addLog('❌ No authentication token found in localStorage', 'error');
        setTesting(false);
        return;
      }
      addLog('✅ Authentication token found', 'success');
      
      // Test 2: Decode token to check if it's valid
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        addLog(`✅ Token decoded - Role: ${payload.role}, ID: ${payload.id}`, 'success');
        
        // Check if token is expired
        const now = Date.now() / 1000;
        if (payload.exp < now) {
          addLog('❌ Token is expired', 'error');
          setTesting(false);
          return;
        }
        addLog('✅ Token is not expired', 'success');
      } catch (e) {
        addLog('❌ Failed to decode token: ' + e.message, 'error');
        setTesting(false);
        return;
      }
      
      // Test 3: Test students API
      addLog('Testing students API...', 'info');
      try {
        const response = await fetch('http://localhost:5000/api/users/students', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        addLog(`Students API Response Status: ${response.status}`, response.ok ? 'success' : 'error');
        
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ Students fetched: ${data.students?.length || 0} students`, 'success');
          
          if (data.students && data.students.length > 0) {
            const firstStudent = data.students[0];
            addLog(`First student: ${firstStudent.fullName} (ID: ${firstStudent._id})`, 'info');
            
            // Test 4: Test update API
            addLog('Testing student update API...', 'info');
            try {
              const updateResponse = await fetch(`http://localhost:5000/api/users/${firstStudent._id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  fullName: firstStudent.fullName,
                  email: firstStudent.email,
                  phone: firstStudent.phone,
                  hostelBlock: firstStudent.hostelBlock,
                  roomNumber: firstStudent.roomNumber
                })
              });
              
              addLog(`Update API Response Status: ${updateResponse.status}`, updateResponse.ok ? 'success' : 'error');
              
              if (updateResponse.ok) {
                const updateData = await updateResponse.json();
                addLog('✅ Update API working correctly', 'success');
              } else {
                const errorText = await updateResponse.text();
                addLog(`❌ Update API failed: ${errorText}`, 'error');
              }
            } catch (updateError) {
              addLog(`❌ Update API error: ${updateError.message}`, 'error');
            }
          }
        } else {
          const errorText = await response.text();
          addLog(`❌ Students API failed: ${errorText}`, 'error');
        }
      } catch (studentsError) {
        addLog(`❌ Students API error: ${studentsError.message}`, 'error');
      }
      
      // Test 5: Check network connectivity
      addLog('Testing backend connectivity...', 'info');
      try {
        const healthResponse = await fetch('http://localhost:5000/api/admin/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        addLog(`Backend connectivity: ${healthResponse.ok ? '✅ Connected' : '❌ Failed'}`, healthResponse.ok ? 'success' : 'error');
      } catch (e) {
        addLog(`❌ Backend connectivity failed: ${e.message}`, 'error');
      }
      
    } catch (error) {
      addLog(`❌ Diagnostics failed: ${error.message}`, 'error');
    }
    
    setTesting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80%',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>API Diagnostics</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={testAPIs}
            disabled={testing}
            style={{
              backgroundColor: testing ? '#ccc' : '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: testing ? 'not-allowed' : 'pointer'
            }}
          >
            {testing ? 'Running Tests...' : 'Run Diagnostics'}
          </button>
        </div>
        
        <div style={{
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '10px',
          height: '400px',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              Click "Run Diagnostics" to test the API endpoints
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{
                padding: '2px 0',
                color: log.type === 'error' ? '#dc3545' : log.type === 'success' ? '#28a745' : '#333'
              }}>
                <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDiagnostics;
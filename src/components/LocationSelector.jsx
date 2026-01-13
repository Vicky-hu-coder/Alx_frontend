import React, { useState, useEffect } from 'react';
import api from '../api';

const LocationSelector = ({ onLocationSelect, initialLocationId = null }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [cells, setCells] = useState([]);
    const [villages, setVillages] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCell, setSelectedCell] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');

    useEffect(() => {
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            const response = await api.get('/locations/type/PROVINCE');
            setProvinces(response.data.content || response.data || []);
        } catch (error) {
            console.error('Failed to fetch provinces:', error);
        }
    };

    const fetchChildren = async (parentId, setChildren) => {
        try {
            const response = await api.get(`/locations/children/${parentId}`);
            setChildren(response.data.content || response.data || []);
        } catch (error) {
            console.error('Failed to fetch location children:', error);
        }
    };

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setSelectedDistrict('');
        setSelectedSector('');
        setSelectedCell('');
        setSelectedVillage('');
        setDistricts([]);
        setSectors([]);
        setCells([]);
        setVillages([]);

        if (provinceId) {
            fetchChildren(provinceId, setDistricts);
            onLocationSelect(provinceId);
        } else {
            onLocationSelect(null);
        }
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId);
        setSelectedSector('');
        setSelectedCell('');
        setSelectedVillage('');
        setSectors([]);
        setCells([]);
        setVillages([]);

        if (districtId) {
            fetchChildren(districtId, setSectors);
            onLocationSelect(districtId);
        } else {
            onLocationSelect(selectedProvince);
        }
    };

    const handleSectorChange = (e) => {
        const sectorId = e.target.value;
        setSelectedSector(sectorId);
        setSelectedCell('');
        setSelectedVillage('');
        setCells([]);
        setVillages([]);

        if (sectorId) {
            fetchChildren(sectorId, setCells);
            onLocationSelect(sectorId);
        } else {
            onLocationSelect(selectedDistrict);
        }
    };

    const handleCellChange = (e) => {
        const cellId = e.target.value;
        setSelectedCell(cellId);
        setSelectedVillage('');
        setVillages([]);

        if (cellId) {
            fetchChildren(cellId, setVillages);
            onLocationSelect(cellId);
        } else {
            onLocationSelect(selectedSector);
        }
    };

    const handleVillageChange = (e) => {
        const villageId = e.target.value;
        setSelectedVillage(villageId);

        if (villageId) {
            onLocationSelect(villageId);
        } else {
            onLocationSelect(selectedCell);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formGroup}>
                <label style={styles.label}>Province</label>
                <select style={styles.select} value={selectedProvince} onChange={handleProvinceChange}>
                    <option value="">Select Province</option>
                    {provinces.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {selectedProvince && (
                <div style={styles.formGroup}>
                    <label style={styles.label}>District</label>
                    <select style={styles.select} value={selectedDistrict} onChange={handleDistrictChange}>
                        <option value="">Select District</option>
                        {districts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedDistrict && (
                <div style={styles.formGroup}>
                    <label style={styles.label}>Sector</label>
                    <select style={styles.select} value={selectedSector} onChange={handleSectorChange}>
                        <option value="">Select Sector</option>
                        {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedSector && (
                <div style={styles.formGroup}>
                    <label style={styles.label}>Cell</label>
                    <select style={styles.select} value={selectedCell} onChange={handleCellChange}>
                        <option value="">Select Cell</option>
                        {cells.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedCell && (
                <div style={styles.formGroup}>
                    <label style={styles.label}>Village</label>
                    <select style={styles.select} value={selectedVillage} onChange={handleVillageChange}>
                        <option value="">Select Village</option>
                        {villages.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    label: {
        fontSize: '13px',
        fontWeight: 500,
        color: '#334155'
    },
    select: {
        width: '100%',
        padding: '12px 14px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        color: '#0f172a',
        background: '#f1f5f9',
        outline: 'none',
        cursor: 'pointer'
    }
};

export default LocationSelector;

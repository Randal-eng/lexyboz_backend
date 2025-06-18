const kitModel = require('../models/kitModel');

const crearKit = async (req, res) => {
    try {
        const { nombre, descripcion, creado_por } = req.body;
        if (!nombre || !creado_por) {
            return res.status(400).json({ message: 'nombre y creado_por son requeridos.' });
        }
        const kit = await kitModel.crearKit({ nombre, descripcion, creado_por });
        return res.status(201).json(kit);
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear kit.', error: error.message });
    }
};

const obtenerKits = async (req, res) => {
    try {
        const kits = await kitModel.obtenerKits();
        return res.status(200).json(kits);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener kits.', error: error.message });
    }
};

const obtenerKitPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const kit = await kitModel.obtenerKitPorId(id);
        if (!kit) return res.status(404).json({ message: 'Kit no encontrado.' });
        return res.status(200).json(kit);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener kit.', error: error.message });
    }
};

const editarKit = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        const kit = await kitModel.editarKit(id, { nombre, descripcion });
        if (!kit) return res.status(404).json({ message: 'Kit no encontrado.' });
        return res.status(200).json(kit);
    } catch (error) {
        return res.status(500).json({ message: 'Error al editar kit.', error: error.message });
    }
};

const eliminarKit = async (req, res) => {
    try {
        const { id } = req.params;
        const kit = await kitModel.eliminarKit(id);
        if (!kit) return res.status(404).json({ message: 'Kit no encontrado.' });
        return res.status(200).json({ message: 'Kit eliminado.', kit });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar kit.', error: error.message });
    }
};

module.exports = {
    crearKit,
    obtenerKits,
    obtenerKitPorId,
    editarKit,
    eliminarKit,
};

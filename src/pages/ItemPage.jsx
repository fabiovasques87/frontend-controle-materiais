import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createItem, getItemById, updateItem } from '../services/itemService';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function ItemPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        item: '',
        data: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD local
        origem: '',
        destino: '',
        servidor: '',
        patrimonio: ''
    });

    useEffect(() => {
        if (id) {
            loadItem();
        }
    }, [id]);

    const loadItem = async () => {
        setLoading(true);
        try {
            const item = await getItemById(id);
            setFormData({
                item: item.item,
                data: item.data.split('T')[0], // Pega apenas YYYY-MM-DD da string ISO
                origem: item.origem,
                destino: item.destino,
                servidor: item.servidor,
                patrimonio: item.patrimonio || ''
            });
        } catch (error) {
            console.error('Failed to load item', error);
            alert('Erro ao carregar item');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await updateItem(id, formData);
            } else {
                await createItem(formData);
            }
            navigate('/');
        } catch (error) {
            console.error('Failed to save item', error);
            alert('Erro ao salvar item');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/" className="p-2 text-gray-500 hover:bg-white rounded-lg transition shadow-sm border border-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {id ? 'Editar Item' : 'Cadastrar Novo Item'}
                    </h1>
                    <p className="text-gray-500 text-sm">Preencha os dados da movimentação do material.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="item" className="block text-sm font-semibold text-gray-700 mb-1">
                                Descrição do Item
                            </label>
                            <div className="relative">
                                <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="item"
                                    name="item"
                                    value={formData.item}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    placeholder="Ex: Notebook Dell Latitude"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="data" className="block text-sm font-semibold text-gray-700 mb-1">
                                Data da Movimentação
                            </label>
                            <input
                                type="date"
                                id="data"
                                name="data"
                                value={formData.data}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="servidor" className="block text-sm font-semibold text-gray-700 mb-1">
                                Servidor Responsável
                            </label>
                            <input
                                type="text"
                                id="servidor"
                                name="servidor"
                                value={formData.servidor}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="Nome do servidor"
                            />
                        </div>

                        <div>
                            <label htmlFor="patrimonio" className="block text-sm font-semibold text-gray-700 mb-1">
                                Patrimônio
                            </label>
                            <input
                                type="text"
                                id="patrimonio"
                                name="patrimonio"
                                value={formData.patrimonio}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="Nº do patrimônio (opcional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="origem" className="block text-sm font-semibold text-gray-700 mb-1">
                                Origem
                            </label>
                            <input
                                type="text"
                                id="origem"
                                name="origem"
                                value={formData.origem}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="Setor de origem"
                            />
                        </div>

                        <div>
                            <label htmlFor="destino" className="block text-sm font-semibold text-gray-700 mb-1">
                                Destino
                            </label>
                            <input
                                type="text"
                                id="destino"
                                name="destino"
                                value={formData.destino}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                placeholder="Setor de destino"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Salvando...' : 'Salvar Material'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

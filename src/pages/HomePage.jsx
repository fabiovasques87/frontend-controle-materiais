import { useEffect, useState, useContext } from 'react';
import { getItems, deleteItem, getActivities } from '../services/itemService';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Package, History, Plus, User as UserIcon, Search, X } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function HomePage() {
    const { user: currentUser } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLogOpen, setIsLogOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [itemsData, activitiesData] = await Promise.all([
                getItems(),
                getActivities()
            ]);
            setItems(itemsData);
            setActivities(activitiesData);
        } catch (error) {
            console.error('Failed to load data', error);
            alert('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            try {
                await deleteItem(id);
                loadData(); // Reload to update both items and activities
            } catch (error) {
                console.error('Failed to delete item', error);
                alert('Erro ao deletar item');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // O backend envia ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
        // Pegamos apenas a parte da data para evitar deslocamento de fuso horário
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${day}/${month}/${year}`;
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20 text-gray-500">
            <div className="animate-spin mr-2"><Package className="w-6 h-6" /></div>
            Carregando dashboard...
        </div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Controle de Materiais</h1>
                    <p className="text-gray-500 text-sm">Gerencie os itens e acompanhe as movimentações.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLogOpen(true)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition relative group"
                        title="Ver Movimentações"
                    >
                        <History className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
                    </button>
                    <Link to="/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-100">
                        <Plus className="w-4 h-4" /> Novo Item
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Items Table Section */}
                <div className="w-full">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" />
                                <h2 className="font-semibold text-gray-800">Itens Cadastrados</h2>
                            </div>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Buscar por servidor ou patrimônio..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition w-full sm:w-64"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Origem/Destino</th>
                                        <th className="px-6 py-4">Servidor</th>
                                        <th className="px-6 py-4">Patrimônio</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(() => {
                                        const filteredItems = items.filter(item => {
                                            const search = searchTerm.toLowerCase();
                                            return (
                                                item.servidor?.toLowerCase().includes(search) ||
                                                item.patrimonio?.toLowerCase().includes(search) ||
                                                item.item?.toLowerCase().includes(search)
                                            );
                                        });

                                        if (filteredItems.length === 0) {
                                            return (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400">Nenhum item encontrado.</td>
                                                </tr>
                                            );
                                        }

                                        return filteredItems.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900 block">{item.item}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase">#{item.id}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.data)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <span className="text-gray-400">De:</span> {item.origem}
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-400">Para:</span> {item.destino}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <UserIcon className="w-3 h-3 text-gray-500" />
                                                        </div>
                                                        <span className="text-sm text-gray-700">{item.servidor}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-600">
                                                        {item.patrimonio || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/edit/${item.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Slide-over Activity Log */}
                {isLogOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
                            onClick={() => setIsLogOpen(false)}
                        ></div>
                        <div className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white shadow-2xl z-[70] border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-amber-500" />
                                    <h2 className="font-semibold text-gray-800">Movimentação</h2>
                                </div>
                                <button
                                    onClick={() => setIsLogOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {activities.length === 0 ? (
                                    <p className="text-center text-gray-400 py-10">Nenhuma atividade registrada.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {activities.map(activity => (
                                            <div key={activity.id} className="border-l-2 border-indigo-100 pl-4 py-1 relative">
                                                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-indigo-400"></div>
                                                <p className="text-sm text-gray-900 font-medium leading-tight">
                                                    {activity.user?.name || 'Usuário'} <span className="font-normal text-gray-500">realizou:</span>
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${activity.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                                        activity.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {activity.action === 'CREATE' ? 'Cadastro' :
                                                            activity.action === 'UPDATE' ? 'Edição' : 'Exclusão'}
                                                    </span>
                                                    <span className="text-xs text-gray-600 italic truncate max-w-[150px]">
                                                        {(() => {
                                                            try {
                                                                const details = JSON.parse(activity.details);
                                                                const name = details.itemName || 'Item';
                                                                const id = details.itemId || '?';
                                                                return `${name} (ID: ${id})`;
                                                            } catch {
                                                                return 'Item';
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(activity.createdAt)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import Avatar from '../components/shared/Avatar'
import Modal from '../components/shared/Modal'
import toast from 'react-hot-toast'

const Admin = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editUser, setEditUser] = useState(null)
    const [form, setForm] = useState({ name: '', email: '', isAdmin: false })
    const [submitting, setSubmitting] = useState(false)

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/users')
            setUsers(data.users)
        } catch {
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!user?.isAdmin) {
            navigate('/')
            return
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers()
    }, [fetchUsers, navigate, user?.isAdmin])

    const openCreate = () => {
        setEditUser(null)
        setForm({ name: '', email: '', isAdmin: false })
        setShowModal(true)
    }

    const openEdit = (u) => {
        setEditUser(u)
        setForm({ name: u.name, email: u.email, isAdmin: u.isAdmin })
        setShowModal(true)
    }

    const handleSubmit = async () => {
        if (!form.name || !form.email) return toast.error('Name and email required')
        setSubmitting(true)
        try {
            if (editUser) {
                const { data } = await api.put(`/admin/users/${editUser._id}`, form)
                setUsers(prev => prev.map(u => u._id === editUser._id ? data.user : u))
                toast.success('User updated')
            } else {
                const { data } = await api.post('/admin/users', form)
                setUsers(prev => [data.user, ...prev])
                toast.success('User created')
            }
            setShowModal(false)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleToggle = async (u) => {
        try {
            const { data } = await api.patch(`/admin/users/${u._id}/toggle`)
            setUsers(prev => prev.map(x => x._id === u._id ? data.user : x))
            toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`)
        } catch {
            toast.error('Failed to toggle status')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return
        try {
            await api.delete(`/admin/users/${id}`)
            setUsers(prev => prev.filter(u => u._id !== id))
            toast.success('User deleted')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed')
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg text-white">

            {/* Header */}
            <div className="bg-dark-sidebar border-b border-dark-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition text-sm"
                    >
                        ← Back
                    </button>
                    <h1 className="text-lg font-semibold">Admin Panel</h1>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-primary hover:bg-secondary text-white text-sm px-4 py-2 rounded-lg transition"
                >
                    + New User
                </button>
            </div>

            {/* Users Table */}
            <div className="p-6">
                {loading ? (
                    <div className="flex justify-center mt-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="bg-dark-sidebar rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-border text-gray-400 text-xs uppercase">
                                    <th className="text-left px-6 py-3">User</th>
                                    <th className="text-left px-6 py-3">Email</th>
                                    <th className="text-left px-6 py-3">Role</th>
                                    <th className="text-left px-6 py-3">Status</th>
                                    <th className="text-right px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr
                                        key={u._id}
                                        className="border-b border-dark-border hover:bg-dark-hover transition"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar src={u.avatar} name={u.name} size="sm" />
                                                <span className="text-sm font-medium">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full
                        ${u.isAdmin ? 'bg-primary/20 text-primary' : 'bg-dark-hover text-gray-400'}`}>
                                                {u.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full
                        ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded hover:bg-dark-hover"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(u)}
                                                    className={`text-xs transition px-2 py-1 rounded hover:bg-dark-hover
                            ${u.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                                                >
                                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                {u._id !== user?._id && (
                                                    <button
                                                        onClick={() => handleDelete(u._id)}
                                                        className="text-xs text-red-400 hover:text-red-300 transition px-2 py-1 rounded hover:bg-dark-hover"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-12">
                                No users yet. Create one!
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editUser ? 'Edit User' : 'Create User'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Name</label>
                        <input
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="Full name"
                            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Email</label>
                        <input
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="Email address"
                            type="email"
                            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isAdmin"
                            checked={form.isAdmin}
                            onChange={e => setForm(p => ({ ...p, isAdmin: e.target.checked }))}
                            className="accent-primary w-4 h-4"
                        />
                        <label htmlFor="isAdmin" className="text-sm text-gray-300">
                            Admin privileges
                        </label>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 text-sm"
                    >
                        {submitting ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default Admin
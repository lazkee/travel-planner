import { useCallback, useEffect, useState } from 'react'
import type * as React from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Modal from '../../../components/ui/Modal'
import Select from '../../../components/ui/Select'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { formatDateTime } from '../../../utils/format'
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRole,
} from '../api/adminUsers.api'
import type { AdminUserDto, AdminUserRole } from '../types/adminUser.types'

const roleOptions: AdminUserRole[] = ['User', 'Admin']

type AdminUserEditFormData = {
  name: string
  email: string
}

const emptyEditFormData: AdminUserEditFormData = {
  name: '',
  email: '',
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { showError, showSuccess } = useToast()
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [editError, setEditError] = useState('')
  const [editFormData, setEditFormData] =
    useState<AdminUserEditFormData>(emptyEditFormData)
  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingUser, setDeletingUser] = useState<AdminUserDto | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextUsers = await getAdminUsers()
      setUsers(nextUsers.filter((user) => user.id !== currentUser?.id))
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleRoleChange(user: AdminUserDto, role: AdminUserRole) {
    if (user.id === currentUser?.id) {
      return
    }

    if (user.role === role) {
      return
    }

    setUpdatingUserId(user.id)

    try {
      const updatedUser = await updateAdminUserRole(user.id, role)
      setUsers((previousUsers) =>
        previousUsers
          .map((item) => (item.id === updatedUser.id ? updatedUser : item))
          .filter((item) => item.id !== currentUser?.id),
      )
      showSuccess('User role updated.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
    } finally {
      setUpdatingUserId(null)
    }
  }

  function openEditDialog(user: AdminUserDto) {
    if (user.id === currentUser?.id) {
      return
    }

    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
    })
    setEditError('')
  }

  function closeEditDialog() {
    if (isEditing) {
      return
    }

    setEditingUser(null)
    setEditError('')
  }

  function handleEditChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setEditFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }))
  }

  function validateEditForm() {
    if (!editFormData.name.trim()) {
      return 'Name is required.'
    }

    if (!editFormData.email.trim()) {
      return 'Email is required.'
    }

    if (!isValidEmail(editFormData.email.trim())) {
      return 'Enter a valid email address.'
    }

    return ''
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingUser || editingUser.id === currentUser?.id) {
      setEditingUser(null)
      return
    }

    const validationError = validateEditForm()

    if (validationError) {
      setEditError(validationError)
      showError(validationError)
      return
    }

    setEditError('')
    setIsEditing(true)

    try {
      const updatedUser = await updateAdminUser(editingUser.id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
      })
      setUsers((previousUsers) =>
        previousUsers
          .map((user) => (user.id === updatedUser.id ? updatedUser : user))
          .filter((user) => user.id !== currentUser?.id),
      )
      setEditingUser(null)
      showSuccess('User updated.')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError)
      setEditError(message)
      showError(message)
    } finally {
      setIsEditing(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingUser || deletingUser.id === currentUser?.id) {
      setDeletingUser(null)
      return
    }

    setIsDeleting(true)

    try {
      await deleteAdminUser(deletingUser.id)
      setUsers((previousUsers) =>
        previousUsers.filter((user) => user.id !== deletingUser.id),
      )
      setDeletingUser(null)
      showSuccess('User deleted.')
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
      setDeletingUser(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const userCountLabel = users.length === 1 ? '1 user' : `${users.length} users`

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-2">
          <p className="m-0 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-blue-600">
            Admin
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-3xl font-bold leading-tight text-slate-900">
              Users
            </h1>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-700">
              {userCountLabel}
            </span>
          </div>
          <p className="m-0 max-w-2xl text-slate-500">
            Manage TravelPlanner accounts and roles.
          </p>
        </div>
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading users..." /> : null}

      {!isLoading && !error && users.length === 0 ? (
        <EmptyState
          description="There are no users to manage yet."
          title="No users found"
        />
      ) : null}

      {!isLoading && users.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-extrabold">ID</th>
                  <th className="px-4 py-3 font-extrabold">Name</th>
                  <th className="px-4 py-3 font-extrabold">Email</th>
                  <th className="px-4 py-3 font-extrabold">Role</th>
                  <th className="px-4 py-3 font-extrabold">Created at</th>
                  <th className="px-4 py-3 font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isUpdatingUser = updatingUserId === user.id

                  return (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-4 font-bold text-slate-600">
                        #{user.id}
                      </td>
                      <td className="px-4 py-4">
                        <div className="grid gap-1">
                          <span className="font-bold text-slate-900">
                            {user.name || 'Unnamed user'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {user.email || 'No email'}
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          aria-label={`Role for ${user.name || user.email}`}
                          className="py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                          disabled={isUpdatingUser}
                          name={`role-${user.id}`}
                          onChange={(event) =>
                            void handleRoleChange(
                              user,
                              event.target.value as AdminUserRole,
                            )
                          }
                          value={user.role}
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            disabled={isDeleting || isEditing || isUpdatingUser}
                            onClick={() => openEditDialog(user)}
                            variant="secondary"
                          >
                            Edit
                          </Button>
                          <Button
                            disabled={isDeleting || isEditing}
                            onClick={() => setDeletingUser(user)}
                            variant="danger"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {!isLoading && error && users.length === 0 ? (
        <div>
          <Button onClick={loadUsers} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete user"
        isOpen={Boolean(deletingUser)}
        isSubmitting={isDeleting}
        message={
          deletingUser
            ? `Delete "${deletingUser.email}"? This cannot be undone.`
            : 'Delete this user?'
        }
        onCancel={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete user"
      />

      <Modal
        isOpen={Boolean(editingUser)}
        onClose={closeEditDialog}
        title="Edit user"
      >
        <form className="grid gap-4" onSubmit={handleEditSubmit}>
          {editError ? <ErrorAlert message={editError} /> : null}

          <Input
            autoComplete="name"
            disabled={isEditing}
            label="Name"
            maxLength={200}
            name="name"
            onChange={handleEditChange}
            required
            value={editFormData.name}
          />

          <Input
            autoComplete="email"
            disabled={isEditing}
            label="Email"
            maxLength={320}
            name="email"
            onChange={handleEditChange}
            required
            type="email"
            value={editFormData.email}
          />

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              disabled={isEditing}
              onClick={closeEditDialog}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button isLoading={isEditing} type="submit" variant="primary">
              Save changes
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default AdminUsersPage

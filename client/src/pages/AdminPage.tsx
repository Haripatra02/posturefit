import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { exerciseApi } from '../api/exerciseApi';
import { adminApi } from '../api/adminApi';
import { Exercise, ExerciseCategory, ExerciseDifficulty } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('neck_shoulder');
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [difficulty, setDifficulty] = useState<ExerciseDifficulty>('beginner');
  const [instructionsText, setInstructionsText] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const data = await exerciseApi.getExercises();
      setExercises(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const openCreateModal = () => {
    setEditingExercise(null);
    setTitle('');
    setDescription('');
    setCategory('neck_shoulder');
    setDurationSeconds(60);
    setDifficulty('beginner');
    setInstructionsText('Sit upright\nGently stretch\nHold for 20 seconds');
    setSafetyNotes('Stop immediately if you experience pain.');
    setModalOpen(true);
  };

  const openEditModal = (ex: Exercise) => {
    setEditingExercise(ex);
    setTitle(ex.title);
    setDescription(ex.description);
    setCategory(ex.category);
    setDurationSeconds(ex.duration_seconds);
    setDifficulty(ex.difficulty);
    setInstructionsText(ex.instructions.join('\n'));
    setSafetyNotes(ex.safety_notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const instructions = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingExercise) {
        await adminApi.updateExercise(editingExercise.id, {
          title,
          description,
          category,
          duration_seconds: durationSeconds,
          difficulty,
          instructions,
          safety_notes: safetyNotes,
        });
        showToast({ type: 'success', title: 'Exercise updated successfully' });
      } else {
        await adminApi.createExercise({
          title,
          description,
          category,
          duration_seconds: durationSeconds,
          difficulty,
          instructions,
          safety_notes: safetyNotes,
          is_active: true,
        });
        showToast({ type: 'success', title: 'New exercise created' });
      }

      setModalOpen(false);
      fetchExercises();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to save exercise', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this exercise from the catalog?')) return;
    try {
      await adminApi.deleteExercise(id);
      showToast({ type: 'info', title: 'Exercise removed' });
      fetchExercises();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to remove exercise', message: err.message });
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-heading">Administrator Portal</h1>
        <p className="text-sm text-charcoal-muted mt-2 max-w-md mx-auto leading-relaxed">
          Access to exercise authoring and catalog administration requires administrator privileges.
        </p>

        <Card className="mt-8 p-5 text-left bg-surface-subtle border-surface-border text-xs text-charcoal-muted">
          <p className="font-semibold text-charcoal-heading mb-1">To enable admin in development:</p>
          <p>
            Make a POST request to <code>/api/admin/users/:userId/role</code> with header{' '}
            <code>X-Admin-Key: posturefit_super_secret_admin_token_2026</code> and body{' '}
            <code>{`{"role": "admin"}`}</code>.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-8 h-8 text-purple-600" />
            Exercise Library Administration
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Create, modify, and curate ergonomic activities in the PostureFit database.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Exercise
        </Button>
      </div>

      {/* Exercises Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-surface-border text-charcoal-muted font-semibold">
                <th className="pb-3">Title</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Difficulty</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-charcoal-body">
              {exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-3 font-semibold text-charcoal-heading">{ex.title}</td>
                  <td className="py-3">
                    <Badge variant="brand" size="sm">
                      {ex.category.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant="default" size="sm">
                      {ex.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3">{ex.duration_seconds}s</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(ex)}
                      className="p-1.5 rounded-lg text-charcoal-muted hover:text-brand-700 hover:bg-brand-50 transition-colors"
                      title="Edit Exercise"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ex.id)}
                      className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              >
                <option value="neck_shoulder">Neck & Shoulder</option>
                <option value="wrist_hand">Wrist & Hand</option>
                <option value="chest_upper_body">Chest & Upper Body</option>
                <option value="seated_mobility">Seated Mobility</option>
                <option value="leg_ankle">Leg & Ankle</option>
                <option value="standing_breaks">Standing Movement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
                Duration (sec)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExerciseDifficulty)}
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
              Instructions (One step per line)
            </label>
            <textarea
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              rows={4}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
              Safety Notes
            </label>
            <input
              type="text"
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div className="pt-3 border-t border-surface-border flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Save Exercise
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

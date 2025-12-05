"use client";

import { FormField } from "@/lib/types/applications";
import { X, Plus } from "lucide-react";

interface FormBuilderProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
}

export default function FormBuilder({ fields, onFieldsChange }: FormBuilderProps) {
  const addField = (type: "essay" | "file") => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: type === "essay" ? "Essay Question" : "File Upload",
      required: true,
      placeholder: type === "essay" ? "Enter your response..." : undefined,
      maxLength: type === "essay" ? 5000 : undefined,
    };
    onFieldsChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onFieldsChange(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter((field) => field.id !== id));
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    onFieldsChange(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Form Builder</h3>
        <div className="flex gap-2">
          <button
            onClick={() => addField("essay")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={18} />
            Add Essay Question
          </button>
          <button
            onClick={() => addField("file")}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            <Plus size={18} />
            Add File Upload
          </button>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No fields added yet. Click the buttons above to add fields.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Field {index + 1} • {field.type === "essay" ? "Essay" : "File Upload"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {index > 0 && (
                    <button
                      onClick={() => moveField(index, index - 1)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {index < fields.length - 1 && (
                    <button
                      onClick={() => moveField(index, index + 1)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}
                  <button onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clubPurple"
                    placeholder="Enter field label"
                  />
                </div>

                {field.type === "essay" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder Text</label>
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clubPurple"
                        placeholder="Enter placeholder text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Length (characters)</label>
                      <input
                        type="number"
                        value={field.maxLength || 5000}
                        onChange={(e) => updateField(field.id, { maxLength: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clubPurple"
                        min="100"
                        max="10000"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required_${field.id}`}
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`required_${field.id}`} className="text-sm font-medium text-gray-700">
                    Required
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

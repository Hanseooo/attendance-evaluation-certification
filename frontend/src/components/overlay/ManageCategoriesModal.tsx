import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/stores/categoryStore";
import { useFetchCategories } from "@/hooks/useFetchCategories";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useDeleteCategory } from "@/hooks/useDeleteCategory";



export function ManageCategoriesModal() {
  const { categories } = useCategoryStore();
  const [newCategory, setNewCategory] = useState("");

  const { loading: loadingCategories } = useFetchCategories();
  const {
    createCategory,
    loading: creating,
    error: createError,
  } = useCreateCategory();

  const {
    deleteCategory,
    loading: deleting,
    error: deleteError,
  } = useDeleteCategory();

  const handleCreate = async () => {
    if (!newCategory.trim()) return;
    await createCategory(newCategory.trim());
    setNewCategory("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="" size="lg" variant="outline">Manage Categories</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        {/* Create category */}
        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={creating}
          />
          <Button onClick={handleCreate} disabled={creating}>
            Add
          </Button>
        </div>

        {createError && (
          <p className="text-sm text-destructive">{createError}</p>
        )}

        {/* Category list */}
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {loadingCategories ? (
            <p className="text-sm text-muted-foreground">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories found.
            </p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">{category.name}</span>

                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting || category.name.toLowerCase() === "other"}
                  onClick={() => deleteCategory(category.id)}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>

        {deleteError && (
          <p className="text-sm text-destructive mt-2">{deleteError}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

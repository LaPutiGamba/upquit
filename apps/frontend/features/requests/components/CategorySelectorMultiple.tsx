"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Loader2Icon } from "lucide-react";

import { boardService, CategoryResponse } from "@/features/boards/services/boardService";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor
} from "@/shared/components/ui/combobox";
import { cn } from "@/shared/lib/utils";
import { getAccessToken } from "@/shared/lib/apiClient";

interface CategorySelectorMultipleProps {
  boardId: string;
  value: string[];
  onChange: (categoryIds: string[]) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export function CategorySelectorMultiple({
  boardId,
  value,
  onChange,
  placeholder = "Add categories...",
  disabled = false
}: CategorySelectorMultipleProps) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useComboboxAnchor();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const token = getAccessToken() ?? undefined;
      const fetchedCategories = await boardService.getBoardCategories(boardId, token);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [boardId]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const hasExactMatch = categories.some((cat) => cat.name.toLowerCase() === searchString.toLowerCase());

  const categoryNames = new Map(categories.map((cat) => [cat.id, cat.name]));

  const handleCreateCategory = async () => {
    if (!searchString.trim() || hasExactMatch) return;

    setIsCreatingCategory(true);
    try {
      const token = getAccessToken() ?? undefined;
      const newCategory = await boardService.addBoardCategory(boardId, searchString.trim(), token);

      setCategories((prev) => [...prev, newCategory]);

      onChange([...value, newCategory.id]);

      setSearchString("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !searchString && value.length > 0) {
      event.preventDefault();
      void (async () => {
        await onChange(value.slice(0, -1));
        await fetchCategories();
      })();
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (!searchString.trim() || hasExactMatch || isCreatingCategory) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void handleCreateCategory();
  };

  const handleSelectCategory = (categoryId: string) => {
    if (!value.includes(categoryId)) {
      onChange([...value, categoryId]);
    }
    setSearchString("");
    setIsOpen(false);
  };

  const handleRemoveCategory = async (categoryId: string) => {
    await onChange(value.filter((id) => id !== categoryId));
    await fetchCategories();
  };

  const handleComboboxValueChange = (nextValue: string[] | null) => {
    const normalizedValue = Array.isArray(nextValue)
      ? nextValue.filter((nextCategoryId) => !nextCategoryId.startsWith("__create__"))
      : [];

    if (
      normalizedValue.length !== value.length ||
      normalizedValue.some((nextCategoryId, index) => nextCategoryId !== value[index])
    ) {
      onChange(normalizedValue);
    }
  };

  const canCreateCategory = Boolean(searchString.trim()) && !hasExactMatch;

  return (
    <Combobox multiple value={value} onValueChange={handleComboboxValueChange}>
      <div ref={anchorRef} className="w-full" data-expanded={isOpen}>
        <ComboboxChips
          className={cn(disabled && "opacity-50")}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        >
          {value.map((categoryId) => {
            const categoryName = categoryNames.get(categoryId) || categoryId;
            const category = categories.find((item) => item.id === categoryId);
            const backgroundColor = category?.hexColor ?? generateColorFromString(categoryName);

            return (
              <ComboboxChip
                key={categoryId}
                onRemove={() => {
                  void handleRemoveCategory(categoryId);
                }}
                showRemove={!disabled}
                className="flex items-center gap-1.5"
              >
                <div
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor }}
                  aria-label={`Category color for ${categoryName}`}
                />
                <span>{categoryName}</span>
              </ComboboxChip>
            );
          })}
          <ComboboxChipsInput
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            value={searchString}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchString(e.target.value)}
            onFocus={() => !disabled && setIsOpen(true)}
            onKeyDown={handleInputKeyDown}
          />
        </ComboboxChips>
      </div>

      {isOpen && (
        <ComboboxContent anchor={anchorRef}>
          <ComboboxList>
            {isLoadingCategories ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin mr-2" />
                Loading categories...
              </div>
            ) : (
              <>
                {categories.length === 0 && <ComboboxEmpty>No categories yet</ComboboxEmpty>}

                {categories.map((category) => {
                  const backgroundColor = category.hexColor ?? generateColorFromString(category.name);

                  return (
                    <ComboboxItem
                      key={category.id}
                      value={category.id}
                      onClick={() => handleSelectCategory(category.id)}
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor }}
                        aria-label={`Category color for ${category.name}`}
                      />
                      <span>{category.name}</span>
                    </ComboboxItem>
                  );
                })}

                {canCreateCategory && (
                  <>
                    <div className="my-1 h-px bg-border" />
                    <ComboboxItem
                      value={`__create__${searchString}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void handleCreateCategory();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void handleCreateCategory();
                      }}
                      disabled={isCreatingCategory}
                    >
                      {isCreatingCategory ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">
                            Create <span className="font-semibold">{searchString}</span>
                          </span>
                        </>
                      )}
                    </ComboboxItem>
                  </>
                )}
              </>
            )}
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  );
}

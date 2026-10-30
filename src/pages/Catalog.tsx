import { useEffect, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { MagazineCard } from "../components/MagazineCard";
import { MagazineForm } from "../components/MagazineForm";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Modal } from "../components/Modal";
import { AuthForm } from "../components/AuthForm";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabase";
import {
  addMagazine,
  deleteMagazine,
  listMyMagazines,
  removeCover,
  setMagazinePublic,
  updateMagazine,
  uploadCover,
  type NewMagazine,
} from "../lib/magazineService";
import { CatalogFilters } from "../components/CatalogFilters";
import { BulkImport } from "../components/BulkImport";
import { MagazineGallery } from "../components/MagazineGallery";
import { CoverLightbox } from "../components/CoverLightbox";
import { ViewModeToggle } from "../components/ViewModeToggle";
import { useViewMode } from "../hooks/useViewMode";
import { applyFilters, defaultFilters, type Filters } from "../lib/filters";
import type { Magazine } from "../types";

export function Catalog() {
  useDocumentTitle("Minha coleção");
  const { session, loading } = useSession();
  const userId = session?.user.id;

  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingMagazine = magazines.find((m) => m.id === editingId);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [viewMode, setViewMode] = useViewMode();
  const [zoomed, setZoomed] = useState<Magazine | null>(null); // capa aberta em tamanho grande
  const pendingMagazine = magazines.find((m) => m.id === pendingDeleteId);

  // Carrega as revistas do banco sempre que o usuário logado mudar.
  useEffect(() => {
    if (!userId) {
      setMagazines([]); // saiu: limpa a lista da tela
      return;
    }
    let cancelled = false; // evita atualizar a tela se o componente já mudou
    listMyMagazines(userId)
      .then((data) => {
        if (!cancelled) setMagazines(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Devolve true se salvou, para o formulário saber se pode limpar os campos.
  async function handleAdd(
    newMagazine: NewMagazine,
    cover: File | null,
  ): Promise<boolean> {
    if (!userId) return false;
    let coverUrl: string | undefined;
    try {
      setError(null);
      if (cover) coverUrl = await uploadCover(cover, userId); // 1º a imagem...
      const created = await addMagazine(
        { ...newMagazine, cover_image_url: coverUrl },
        userId,
      ); // 2º a linha
      setMagazines([created, ...magazines]);
      return true;
    } catch (e) {
      // Se a imagem subiu mas a linha falhou, a imagem ficaria órfã: desfazemos.
      if (coverUrl) await removeCover(coverUrl).catch(() => {});
      setError((e as Error).message);
      return false;
    }
  }

  async function handleUpdate(
    changes: NewMagazine,
    cover: File | null,
  ): Promise<boolean> {
    if (!userId || !editingMagazine) return false;
    let newCoverUrl: string | undefined;
    try {
      setError(null);
      if (cover) newCoverUrl = await uploadCover(cover, userId);
      const updated = await updateMagazine(
        editingMagazine.id,
        newCoverUrl ? { ...changes, cover_image_url: newCoverUrl } : changes, // sem capa nova: mantém a atual
      );
      setMagazines(magazines.map((m) => (m.id === updated.id ? updated : m)));
      // Capa trocada com sucesso: a antiga virou lixo no Storage, removemos.
      if (newCoverUrl && editingMagazine.cover_image_url) {
        await removeCover(editingMagazine.cover_image_url).catch(() => {});
      }
      setEditingId(null); // fecha a janela
      return true;
    } catch (e) {
      if (newCoverUrl) await removeCover(newCoverUrl).catch(() => {}); // desfaz o upload órfão
      setError((e as Error).message);
      return false;
    }
  }

  async function handleTogglePublic(magazine: Magazine) {
    try {
      setError(null);
      await setMagazinePublic(magazine.id, !magazine.is_public);
      // map: devolve a MESMA lista, trocando só a revista que mudou
      setMagazines(
        magazines.map((m) =>
          m.id === magazine.id ? { ...m, is_public: !m.is_public } : m,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function confirmDelete() {
    if (!pendingMagazine) return;
    try {
      setError(null);
      await deleteMagazine(pendingMagazine); // só tira da tela DEPOIS de o banco confirmar
      setMagazines(magazines.filter((m) => m.id !== pendingDeleteId));
    } catch (e) {
      setError((e as Error).message);
    }
    setPendingDeleteId(null);
  }

  // ESTADO DERIVADO: não é useState. É recalculado a cada desenho, a partir de dois estados.
  const visibleMagazines = applyFilters(magazines, filters);

  if (loading)
    return (
      <div className="container">
        <p className="subtitle">Carregando...</p>
      </div>
    );
  if (!session) {
    return (
      <div className="container">
        <header className="page-head">
          <p className="eyebrow">Área restrita</p>
          <h1>Minha coleção</h1>
        </header>
        <div className="auth">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Acervo pessoal</p>
        <h1>Minha coleção</h1>
      </header>

      <p className="subtitle">
        Logado como {session.user.email}
        <button className="btn--small" onClick={() => supabase.auth.signOut()}>
          Sair
        </button>
      </p>
      <p className="subtitle">
        {visibleMagazines.length} de {magazines.length} revistas
      </p>

      {error && <p className="form__error">Erro: {error}</p>}

      {/* <details> é um recurso nativo do HTML: abre e fecha sozinho, sem JavaScript */}
      <details className="panel">
        <summary>+ Nova revista</summary>
        <MagazineForm onSubmit={handleAdd} />
      </details>

      <details className="panel">
        <summary>+ Importar várias capas</summary>
        {/* O lote novo entra na frente da lista, sem precisar recarregar do banco */}
        <BulkImport
          userId={session.user.id}
          existing={magazines}
          onImported={(created) =>
            setMagazines((current) => [...created, ...current])
          }
        />
      </details>

      <div className="toolbar">
        <CatalogFilters filters={filters} onChange={setFilters} />
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {magazines.length > 0 && visibleMagazines.length === 0 && (
        <p className="subtitle">
          Nenhuma revista encontrada com estes filtros.
        </p>
      )}

      <MagazineGallery mode={viewMode}>
        {visibleMagazines.map((magazine) => (
          <MagazineCard
            key={magazine.id}
            magazine={magazine}
            onDelete={setPendingDeleteId}
            onTogglePublic={handleTogglePublic}
            onEdit={(m) => setEditingId(m.id)}
            onOpenCover={viewMode === "mosaico" ? setZoomed : undefined}
          />
        ))}
      </MagazineGallery>

      {zoomed && <CoverLightbox magazine={zoomed} magazines={visibleMagazines} onChange={setZoomed} onClose={() => setZoomed(null)} />}

      {editingMagazine && (
        <Modal onClose={() => setEditingId(null)}>
          {/* key: ao editar OUTRA revista o React cria um formulário novo, com os valores dela */}
          <MagazineForm
            key={editingMagazine.id}
            initial={editingMagazine}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
          />
        </Modal>
      )}

      {pendingMagazine && (
        <ConfirmDialog
          message={`Apagar "${pendingMagazine.title}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}

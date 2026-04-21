import SectionBTemplateEditor from "@/components/section-b-template-editor";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function EditTemplatePage({ params }: Props) {
  const { templateId } = await params;

  return (
    <SectionBTemplateEditor
      templateId={templateId}
      title="Редакция на шаблон за атестация"
      description="Отвори съществуващ TEACHER шаблон, промени методиката или custom въпросите и го запази отново."
    />
  );
}

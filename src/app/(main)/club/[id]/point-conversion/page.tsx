import PointConversionSettings from '../PointConversionSettings.client';

export default async function ClubPointConversionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PointConversionSettings clubId={id} />;
}
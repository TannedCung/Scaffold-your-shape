import PointConversionSettings from '../PointConversionSettings.client';

export default function ClubPointConversionPage({ params }: { params: { id: string } }) {
  return <PointConversionSettings clubId={params.id} />;
} 
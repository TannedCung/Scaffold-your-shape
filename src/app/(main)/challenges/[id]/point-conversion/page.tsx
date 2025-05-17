import PointConversionSettings from '../PointConversionSettings.client';

export default async function ChallengePointConversionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PointConversionSettings challengeId={id} />;
} 
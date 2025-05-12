import PointConversionSettings from './PointConversionSettings.client';

export default function ChallengePointConversionPage({ params }: { params: { id: string } }) {
  return <PointConversionSettings challengeId={params.id} />;
} 
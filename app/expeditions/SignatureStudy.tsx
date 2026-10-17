import KilaueaStudy from './Kilauea';
import ReykjanesStudy from './Reykjanes';
import StHelensStudy from './StHelens';
import EtnaStudy from './Etna';
import TajogaiteStudy from './Tajogaite';
import VesuviusStudy from './Vesuvius';

export function SignatureStudy({ slug }: { slug: string }) {
  switch (slug) {
    case 'kilauea': return <KilaueaStudy />;
    case 'reykjanes': return <ReykjanesStudy />;
    case 'st-helens': return <StHelensStudy />;
    case 'etna': return <EtnaStudy />;
    case 'tajogaite': return <TajogaiteStudy />;
    case 'vesuvius': return <VesuviusStudy />;
    default: return null;
  }
}

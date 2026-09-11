import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  ImagePlus,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Radio,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

type Phase = 'select' | 'checking' | 'result';
type Network = 'MTN' | 'Airtel' | 'Glo' | '9mobile';
type Comment = {
  id: number;
  name: string;
  location: string;
  text: string;
  color: string;
  likes: number;
  liked: boolean;
  replies: number;
  image?: string;
};

const states = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT - Abuja',
];

const networks: { name: Network; short: string; color: string }[] = [
  { name: 'MTN', short: 'MTN', color: '#f2c42f' },
  { name: 'Airtel', short: 'air', color: '#df3f47' },
  { name: 'Glo', short: 'Glo', color: '#42a95a' },
  { name: '9mobile', short: '9m', color: '#263e2c' },
];

const seededComments: Comment[] = [
  { id: 1, name: 'Oluwaseun A.', location: 'Lagos', text: 'The flow is clean. I am checking the data scheme demo from Yaba.', color: '#397f61', likes: 38, liked: false, replies: 4 },
  { id: 2, name: 'Musa Bello', location: 'Kaduna', text: 'Nice to see every state listed. The safety note is important.', color: '#a96b3f', likes: 24, liked: false, replies: 2 },
  { id: 3, name: 'Chiamaka E.', location: 'Enugu', text: 'The free-data concept feels simple to follow and easy to understand.', color: '#8a5e98', likes: 51, liked: false, replies: 6 },
  { id: 4, name: 'Tomiwa K.', location: 'Oyo', text: 'Testing Airtel for the local demo. Good luck to everyone joining in.', color: '#3474a8', likes: 17, liked: false, replies: 1 },
];

function App() {
  const [state, setState] = useState('');
  const [network, setNetwork] = useState<Network | ''>('');
  const [phase, setPhase] = useState<Phase>('select');
  const [progress, setProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>(seededComments);
  const [postLiked, setPostLiked] = useState(false);
  const [composer, setComposer] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>();
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'checking') return;
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return Math.min(current + (current < 62 ? 17 : 11), 100);
      });
    }, 580);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'checking' && progress >= 100) {
      const timer = window.setTimeout(() => setPhase('result'), 500);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [phase, progress]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const startCheck = () => {
    if (!state || !network) return;
    setPhase('checking');
  };

  const resetOffer = () => {
    setPhase('select');
    setProgress(0);
    setState('');
    setNetwork('');
  };

  const toggleCommentLike = (id: number) => {
    setComments((current) => current.map((comment) => comment.id === id
      ? { ...comment, liked: !comment.liked, likes: comment.likes + (comment.liked ? -1 : 1) }
      : comment));
  };

  const shareDemo = async () => {
    const shareText = 'Explore the free-data scheme demo — built for safe local interaction.';
    try {
      await navigator.clipboard?.writeText(shareText);
      setToast('Demo link message copied locally');
    } catch {
      setToast('Sharing is simulated in this demo');
    }
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAttachment(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!composer.trim() && !attachment) return;
    setComments((current) => [{
      id: Date.now(),
      name: 'You',
      location: state || 'Nigeria',
      text: composer.trim() || 'Shared a local image with the community.',
      color: '#0e5037',
      likes: 0,
      liked: false,
      replies: 0,
      image: attachment,
    }, ...current]);
    setComposer('');
    setAttachment(undefined);
    if (fileRef.current) fileRef.current.value = '';
    setToast('Comment added to this local demo');
  };

  const scrollToComments = () => commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const startReply = (name: string) => {
    setComposer(`@${name} `);
    window.setTimeout(() => document.querySelector<HTMLInputElement>('[data-testid="input-comment"]')?.focus(), 0);
  };

  return (
    <main className="page-shell" data-testid="page-offer-demo">
      <div className="topline" data-testid="banner-demo-status">
        <ShieldCheck size={13} aria-hidden="true" />
        <span>Safe local demo</span>
        <span>No reward, phone number, or personal data is submitted</span>
      </div>

      <nav className="nav" aria-label="Primary navigation">
        <div className="brand" data-testid="brand-data-scheme-demo">
          <div className="brand-mark">O</div>
          <div>
            <div className="brand-name">FREE DATA SCHEME</div>
            <span className="brand-sub">community access / local build</span>
          </div>
        </div>
        <div className="nav-note"><Radio size={12} /> interactive campaign preview</div>
      </nav>

      <section className="hero-wrap">
        <div className="hero-grid">
          <article className="hero-card" data-testid="card-hero">
            <div className="hero-stamp">built for<br />the community</div>
            <div className="kicker"><i /> community data access</div>
            <h1 className="hero-title">Big love.<br /><em>Big data.</em><br />Zero stress.</h1>
            <p className="hero-copy">
              A bold, safe concept for a free-data scheme across Nigeria.
              Pick your home state and network to preview the experience in seconds.
            </p>
            <div className="hero-data">
              <strong>10GB</strong>
              <span>demo reward concept</span>
            </div>
          </article>

          <OfferPanel
            phase={phase}
            state={state}
            network={network}
            progress={progress}
            onState={setState}
            onNetwork={setNetwork}
            onStart={startCheck}
            onReset={resetOffer}
          />
        </div>
      </section>

      <section className="section" ref={commentRef}>
        <div className="section-heading">
          <div>
            <div className="section-kicker">the community is talking</div>
            <h2 className="section-title">Live from the public wall.</h2>
          </div>
          <p className="section-note">Seeded local comments make the concept feel alive. Every interaction stays in this browser.</p>
        </div>
        <div className="content-grid">
          <article className="feed-card" data-testid="card-community-feed">
            <div className="feed-summary">
              <span><strong>{postLiked ? 342 : 341}</strong> reactions from the community</span>
              <span><strong>{comments.length}</strong> comments · 18 shares</span>
            </div>
            <div className="feed-actions">
              <button className={`feed-action ${postLiked ? 'active' : ''}`} onClick={() => setPostLiked((liked) => !liked)} data-testid="button-like-post">
                <Heart size={15} fill={postLiked ? 'currentColor' : 'none'} /> Like
              </button>
              <button className="feed-action" onClick={scrollToComments} data-testid="button-comment-post">
                <MessageCircle size={15} /> Comment
              </button>
              <button className="feed-action" onClick={shareDemo} data-testid="button-share-post">
                <Share2 size={15} /> Share
              </button>
            </div>
            <div className="comments-list" data-testid="list-comments">
              {comments.map((comment) => (
                <CommentRow key={comment.id} comment={comment} onLike={() => toggleCommentLike(comment.id)} onReply={() => startReply(comment.name)} />
              ))}
            </div>
            <form className="composer" onSubmit={submitComment} data-testid="form-comment-composer">
              <div className="composer-line">
                <div className="avatar" style={{ background: '#0e5037' }} aria-hidden="true">YO</div>
                <input
                  className="composer-input"
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  placeholder="Add your voice to the public wall..."
                  maxLength={200}
                  data-testid="input-comment"
                  aria-label="Write a local comment"
                />
                <button type="button" className="icon-button" onClick={() => fileRef.current?.click()} data-testid="button-attach-image" aria-label="Attach a local image">
                  <ImagePlus size={16} />
                </button>
                <button type="submit" className="icon-button send-button" data-testid="button-send-comment" aria-label="Post local comment">
                  <Send size={15} />
                </button>
                <input ref={fileRef} className="hidden-input" type="file" accept="image/*" onChange={handleFile} data-testid="input-comment-image" />
              </div>
              {attachment && (
                <div className="attachment" data-testid="preview-comment-image">
                  <img src={attachment} alt="Local attachment preview" />
                  <button type="button" onClick={() => { setAttachment(undefined); if (fileRef.current) fileRef.current.value = ''; }} data-testid="button-remove-attachment" aria-label="Remove attachment"><X size={11} /></button>
                </div>
              )}
            </form>
          </article>
          <aside className="safety-card" data-testid="card-safety">
            <div className="safety-icon"><LockKeyhole size={19} /></div>
            <h3>Real feeling.<br />Safe behavior.</h3>
            <p>This concept keeps the excitement of a live offer while making the boundaries obvious.</p>
            <div className="safety-list">
              <div className="safety-item"><ShieldCheck size={16} /><span>No phone number field, payment flow, or account sign-in.</span></div>
              <div className="safety-item"><Wifi size={16} /><span>No network API call. The activation state is simulated locally.</span></div>
              <div className="safety-item"><Users size={16} /><span>Comments, likes, replies, and image previews never leave this page.</span></div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="footer">
        <div><strong>FREE DATA SCHEME / CONCEPT 01</strong><br />A safe interface study for community data-access campaigns.</div>
        <div>Made local by default. <strong>Demo only.</strong></div>
      </footer>
      {toast && <div className="toast" role="status" data-testid="status-toast">{toast}</div>}
    </main>
  );
}

function OfferPanel({
  phase, state, network, progress, onState, onNetwork, onStart, onReset,
}: {
  phase: Phase;
  state: string;
  network: Network | '';
  progress: number;
  onState: (value: string) => void;
  onNetwork: (value: Network) => void;
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <article className="offer-panel" data-testid="card-offer-flow">
      {phase === 'select' && (
        <>
          <div className="panel-head">
            <div><div className="panel-label">01 / choose your coordinates</div><h2 className="panel-title">Find your<br />data drop.</h2></div>
            <div className="status-pill"><span className="status-dot" /> demo live</div>
          </div>
          <p className="panel-blurb">Select a state and mobile network to unlock the simulated offer check. No personal details needed.</p>
          <label className="field-label" htmlFor="state-select">Your state</label>
          <div className="select-wrap">
            <select id="state-select" value={state} onChange={(event) => onState(event.target.value)} data-testid="select-state">
              <option value="">Select a Nigerian state</option>
              {states.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown className="select-chevron" size={17} />
          </div>
          <div className="field-label network-label">Your network</div>
          <div className="network-grid" role="group" aria-label="Choose your mobile network">
            {networks.map((item) => (
              <button
                type="button"
                key={item.name}
                className={`network-choice ${network === item.name ? 'active' : ''}`}
                onClick={() => onNetwork(item.name)}
                data-testid={`button-network-${item.name.toLowerCase().replace('mobile', '')}`}
              >
                <span className="network-badge" style={{ background: item.color, color: item.name === 'MTN' ? '#173c2c' : '#fff' }}>{item.short}</span>
                <span><span className="network-name">{item.name}</span><span className="network-type">mobile data</span></span>
              </button>
            ))}
          </div>
          <button type="button" className="cta" disabled={!state || !network} onClick={onStart} data-testid="button-start-check">
            <span>Preview my offer</span><ArrowRight size={17} />
          </button>
          <div className="tiny-safe"><LockKeyhole size={13} /><span>Demo activation only. No data is sent to any network.</span></div>
        </>
      )}
      {phase === 'checking' && <ProgressView progress={progress} />}
      {phase === 'result' && <ResultView state={state} network={network} onReset={onReset} />}
    </article>
  );
}

function ProgressView({ progress }: { progress: number }) {
  const steps = ['Reading your state selection', 'Matching a demo network route', 'Preparing a safe activation result'];
  const activeStep = progress >= 72 ? 2 : progress >= 35 ? 1 : 0;
  return (
    <div className="progress-view" data-testid="status-progress">
      <div className="panel-label">02 / local simulation</div>
      <div className="progress-top"><h3>Checking the scheme...</h3><span className="progress-pct">{progress}%</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="progress-step-list">
        {steps.map((step, index) => (
          <div className={`progress-step ${index === activeStep ? 'current' : ''} ${index < activeStep ? 'done' : ''}`} key={step} data-testid={`status-step-${index}`}>
            <span className="step-icon">{index < activeStep ? <Check size={13} /> : index === activeStep ? <span className="loading-dot" /> : String(index + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
      <p className="progress-note">This is a front-end simulation. The result is generated in your browser and does not contact a carrier or any third party.</p>
    </div>
  );
}

function ResultView({ state, network, onReset }: { state: string; network: Network | ''; onReset: () => void }) {
  return (
    <div data-testid="status-activation-result">
      <div className="result-icon"><Check size={28} strokeWidth={3} /></div>
      <div className="panel-label">03 / preview complete</div>
      <h2 className="result-title">Your demo result<br />is ready.</h2>
      <p className="result-copy">The local experience is complete. This confirmation is intentionally simulated: no reward has been issued and no information was submitted.</p>
      <div className="result-meta">
        <div><span>selected state</span><strong>{state}</strong></div>
        <div><span>selected network</span><strong>{network}</strong></div>
      </div>
      <button type="button" className="cta secondary" onClick={onReset} data-testid="button-reset-offer">
        <span>Try another selection</span><Zap size={16} />
      </button>
      <div className="tiny-safe"><Sparkles size={13} /><span>Demo reference: DATA-LOCAL-1042</span></div>
    </div>
  );
}

function CommentRow({ comment, onLike, onReply }: { comment: Comment; onLike: () => void; onReply: () => void }) {
  return (
    <div className="comment-row" data-testid={`comment-${comment.id}`}>
      <div className="avatar" style={{ background: comment.color }} data-testid={`avatar-comment-${comment.id}`}>{comment.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
      <div>
        <div className="comment-bubble">
          <span className="comment-name">{comment.name}</span><span className="comment-location"><MapPin size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> {comment.location}</span>
          <p className="comment-text" data-testid={`text-comment-${comment.id}`}>{comment.text}</p>
          {comment.image && <img className="comment-image" src={comment.image} alt="User attached local image" />}
        </div>
        <div className="comment-tools">
          <button type="button" className={comment.liked ? 'active' : ''} onClick={onLike} data-testid={`button-like-comment-${comment.id}`}><Heart size={11} fill={comment.liked ? 'currentColor' : 'none'} /> Like {comment.likes}</button>
          <button type="button" onClick={onReply} data-testid={`button-reply-comment-${comment.id}`}>Reply {comment.replies}</button>
          <span>now</span>
        </div>
      </div>
    </div>
  );
}

export default App;

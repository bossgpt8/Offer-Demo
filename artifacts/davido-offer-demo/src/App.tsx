import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Heart,
  ImagePlus,
  LockKeyhole,
  Megaphone,
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
} from 'lucide-react';
import { useCreateGiveawayEntry, type GiveawayEntry, type GiveawayEntryInput } from '@workspace/api-client-react';

type Network = GiveawayEntryInput['network'];
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
  { id: 1, name: 'Oluwaseun A.', location: 'Lagos', text: 'The entry flow is clear. I am checking the scheme details from Yaba.', color: '#397f61', likes: 38, liked: false, replies: 4 },
  { id: 2, name: 'Musa Bello', location: 'Kaduna', text: 'Nice to see every state listed. The safety note is important.', color: '#a96b3f', likes: 24, liked: false, replies: 2 },
  { id: 3, name: 'Chiamaka E.', location: 'Enugu', text: 'The free-data concept feels simple to follow and easy to understand.', color: '#8a5e98', likes: 51, liked: false, replies: 6 },
  { id: 4, name: 'Tomiwa K.', location: 'Oyo', text: 'Testing Airtel for the local demo. Good luck to everyone joining in.', color: '#3474a8', likes: 17, liked: false, replies: 1 },
];
const autoCommentProfiles = [
  { name: 'Favour I.', location: 'Abuja', color: '#7360a9' },
  { name: 'Ibrahim S.', location: 'Kano', color: '#2a7e61' },
  { name: 'Ngozi M.', location: 'Port Harcourt', color: '#975937' },
  { name: 'Ridwan T.', location: 'Ilorin', color: '#3e6999' },
];
const autoCommentTexts = [
  'Just joined from my side, the process is smooth.',
  'Keeping my fingers crossed for the giveaway result.',
  'The network selector and state list worked quickly for me.',
  'Thanks for keeping the entry flow straightforward.',
];

type FormErrors = Partial<Record<'phoneNumber' | 'state' | 'network' | 'terms' | 'contact', string>>;

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const popunderUrl = 'https://omg10.com/4/11768279';
  const adCooldownMs = 2 * 60 * 1000;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState('');
  const [network, setNetwork] = useState<Network | ''>('');
  const [consentToTerms, setConsentToTerms] = useState(false);
  const [consentToContact, setConsentToContact] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [comments, setComments] = useState<Comment[]>(seededComments);
  const [postLiked, setPostLiked] = useState(false);
  const [communityReactions, setCommunityReactions] = useState(341);
  const [composer, setComposer] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>();
  const [toast, setToast] = useState('');
  const [submittedEntry, setSubmittedEntry] = useState<GiveawayEntry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLDivElement>(null);
  const lastAdOpenAtRef = useRef(0);
  const createEntry = useCreateGiveawayEntry();

  const clearError = (field: keyof FormErrors) => {
    if (!errors[field]) return;
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const normalizePhone = (value: string) => {
    const compact = value.replace(/[^\d+]/g, '');
    if (compact.startsWith('0')) return `+234${compact.slice(1)}`;
    if (compact.startsWith('234')) return `+${compact}`;
    if (/^[789]\d{9}$/.test(compact)) return `+234${compact}`;
    return compact;
  };

  const validate = (): GiveawayEntryInput | null => {
    const nextErrors: FormErrors = {};
    const compact = phoneNumber.replace(/[^\d+]/g, '');
    const validNigerianPhone = /^(?:0[789]\d{9}|\+?234[789]\d{9}|[789]\d{9})$/.test(compact);
    if (!validNigerianPhone) nextErrors.phoneNumber = 'Enter a valid Nigerian mobile number, for example 801 234 5678.';
    if (!state) nextErrors.state = 'Select the state where you live.';
    if (!network) nextErrors.network = 'Choose your mobile network.';
    if (!consentToTerms) nextErrors.terms = 'Please agree to the terms and privacy notice to enter.';
    if (!consentToContact) nextErrors.contact = 'Please allow giveaway-related contact so we can follow up.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !network || !state) return null;
    return {
      phoneNumber: normalizePhone(phoneNumber),
      state,
      network,
      consentToTerms: true,
      consentToContact: true,
    };
  };

  const handleEntrySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createEntry.isPending) return;
    const data = validate();
    if (!data) return;
    setErrors({});
    createEntry.reset();
    createEntry.mutate({ data }, {
      onSuccess: (entry) => {
        setSubmittedEntry(entry);
        setToast('Your entry was received securely');
      },
      onError: () => {
        setToast('We could not save the entry. Please try again.');
      },
    });
  };

  const resetEntry = () => {
    setSubmittedEntry(null);
    setErrors({});
    setPhoneNumber('');
    setState('');
    setNetwork('');
    setConsentToTerms(false);
    setConsentToContact(false);
    createEntry.reset();
  };

  const toggleCommentLike = (id: number) => {
    setComments((current) => current.map((comment) => comment.id === id
      ? { ...comment, liked: !comment.liked, likes: comment.likes + (comment.liked ? -1 : 1) }
      : comment));
  };

  const shareDemo = async () => {
    const shareText = 'Explore the Free Data Scheme entry page — built for clear, safe local interaction.';
    try {
      await navigator.clipboard?.writeText(shareText);
      setToast('Share text copied locally');
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

  useEffect(() => {
    const handleGlobalClick = () => {
      const now = Date.now();
      if (now - lastAdOpenAtRef.current < adCooldownMs) return;

      const popunder = window.open(popunderUrl, '_blank', 'noopener,noreferrer');
      if (!popunder) return;

      popunder.blur();
      window.focus();
      lastAdOpenAtRef.current = now;
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [adCooldownMs, popunderUrl]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const profile = autoCommentProfiles[Math.floor(Math.random() * autoCommentProfiles.length)];
      const text = autoCommentTexts[Math.floor(Math.random() * autoCommentTexts.length)];

      setComments((current) => {
        const nextComment: Comment = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          name: profile.name,
          location: profile.location,
          text,
          color: profile.color,
          likes: Math.floor(Math.random() * 9) + 1,
          liked: false,
          replies: Math.floor(Math.random() * 4),
        };
        const withNew = [nextComment, ...current].slice(0, 40);
        const likeIndex = Math.floor(Math.random() * withNew.length);
        return withNew.map((comment, index) => (
          index === likeIndex ? { ...comment, likes: comment.likes + 1 } : comment
        ));
      });

      setCommunityReactions((count) => count + Math.floor(Math.random() * 3) + 1);
    }, 8000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="page-shell" data-testid="page-offer-demo">
      <div className="topline" data-testid="banner-demo-status">
        <ShieldCheck size={13} aria-hidden="true" />
        <span data-testid="text-banner-label">Safe entry preview</span>
        <span data-testid="text-banner-disclosure">Your information is submitted only when you choose to enter</span>
      </div>

      <nav className="nav" aria-label="Primary navigation" data-testid="nav-primary">
        <div className="brand" data-testid="brand-data-scheme-demo">
          <div className="brand-mark" data-testid="mark-data-scheme">O</div>
          <div>
            <div className="brand-name">FREE DATA SCHEME</div>
            <span className="brand-sub">community access / clear entry</span>
          </div>
        </div>
        <div className="nav-note" data-testid="text-nav-note"><Radio size={12} /> giveaway entry page</div>
      </nav>

      <section className="hero-wrap" data-testid="section-entry">
        <div className="hero-grid">
          <article className="hero-card" data-testid="card-hero">
            <div className="hero-stamp" data-testid="badge-hero-stamp">built for<br />the community</div>
            <div className="kicker"><i /> community data access</div>
            <h1 className="hero-title" data-testid="heading-hero">Big love.<br /><em>Fair entry.</em><br />Zero stress.</h1>
            <p className="hero-copy" data-testid="text-hero-copy">
              Enter once with the details needed to review your giveaway entry.
              We explain what happens before you submit, without payment, pressure, or surprise redirects.
            </p>
            <div className="hero-data" data-testid="text-hero-status">
              <strong>01</strong>
              <span>clear entry, one reference</span>
            </div>
          </article>

          {submittedEntry ? (
            <SuccessPanel entry={submittedEntry} onReset={resetEntry} />
          ) : (
            <EntryFormPanel
              phoneNumber={phoneNumber}
              state={state}
              network={network}
              consentToTerms={consentToTerms}
              consentToContact={consentToContact}
              errors={errors}
              isPending={createEntry.isPending}
              serverError={createEntry.error}
              onPhone={(value) => { setPhoneNumber(value); clearError('phoneNumber'); }}
              onState={(value) => { setState(value); clearError('state'); }}
              onNetwork={(value) => { setNetwork(value); clearError('network'); }}
              onTerms={(value) => { setConsentToTerms(value); clearError('terms'); }}
              onContact={(value) => { setConsentToContact(value); clearError('contact'); }}
              onSubmit={handleEntrySubmit}
            />
          )}
        </div>
      </section>

      <section className="section" data-testid="section-main-ads">
        <AdBreak />
      </section>

      <section className="section" ref={commentRef} data-testid="section-community">
        <div className="section-heading">
          <div>
            <div className="section-kicker">the community is talking</div>
            <h2 className="section-title" data-testid="heading-community">Live from the public wall.</h2>
          </div>
          <p className="section-note" data-testid="text-community-disclosure">Comments are a local-only demo. They are not part of your giveaway entry and never leave this browser.</p>
        </div>
        <div className="content-grid">
          <article className="feed-card" data-testid="card-community-feed">
            <div className="feed-summary">
              <span><strong data-testid="text-reaction-count">{communityReactions + (postLiked ? 1 : 0)}</strong> reactions from the community</span>
              <span><strong data-testid="text-comment-count">{comments.length}</strong> comments · 18 shares</span>
            </div>
            <div className="feed-actions">
              <button className={`feed-action ${postLiked ? 'active' : ''}`} onClick={() => setPostLiked((liked) => !liked)} data-testid="button-like-post" type="button">
                <Heart size={15} fill={postLiked ? 'currentColor' : 'none'} /> Like
              </button>
              <button className="feed-action" onClick={scrollToComments} data-testid="button-comment-post" type="button">
                <MessageCircle size={15} /> Comment
              </button>
              <button className="feed-action" onClick={shareDemo} data-testid="button-share-post" type="button">
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
                  <img src={attachment} alt="Local attachment preview" data-testid="img-comment-attachment" />
                  <button type="button" onClick={() => { setAttachment(undefined); if (fileRef.current) fileRef.current.value = ''; }} data-testid="button-remove-attachment" aria-label="Remove attachment"><X size={11} /></button>
                </div>
              )}
            </form>
          </article>
          <aside className="safety-card" data-testid="card-safety">
            <div className="safety-icon"><LockKeyhole size={19} /></div>
            <h3 data-testid="heading-safety">Real feeling.<br />Safe behavior.</h3>
            <p data-testid="text-safety-intro">This concept keeps the excitement of a live offer while making the boundaries obvious.</p>
            <div className="safety-list">
              <div className="safety-item" data-testid="text-safety-entry"><ShieldCheck size={16} /><span>Your entry asks only for a phone number, state, network, and two clear permissions.</span></div>
              <div className="safety-item" data-testid="text-safety-carrier"><Wifi size={16} /><span>Carrier fulfillment is not connected yet. No data bundle is issued from this page.</span></div>
              <div className="safety-item" data-testid="text-safety-community"><Users size={16} /><span>Comments, likes, replies, and image previews never leave this page.</span></div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="footer" data-testid="footer-demo">
        <div><strong>FREE DATA SCHEME / CONCEPT 01</strong><br />A transparent interface study for community data-access campaigns.</div>
        <div>Made local by default. <strong>Entry review only.</strong></div>
      </footer>
      {toast && <div className="toast" role="status" data-testid="status-toast">{toast}</div>}
    </main>
  );
}

function EntryFormPanel({
  phoneNumber,
  state,
  network,
  consentToTerms,
  consentToContact,
  errors,
  isPending,
  serverError,
  onPhone,
  onState,
  onNetwork,
  onTerms,
  onContact,
  onSubmit,
}: {
  phoneNumber: string;
  state: string;
  network: Network | '';
  consentToTerms: boolean;
  consentToContact: boolean;
  errors: FormErrors;
  isPending: boolean;
  serverError: unknown;
  onPhone: (value: string) => void;
  onState: (value: string) => void;
  onNetwork: (value: Network) => void;
  onTerms: (value: boolean) => void;
  onContact: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const apiError = serverError as { response?: { data?: { error?: string } }; message?: string } | null;
  const serverMessage = apiError?.response?.data?.error ?? apiError?.message;

  return (
    <article className="offer-panel entry-panel" data-testid="card-entry-form">
      <div className="panel-head">
        <div><div className="panel-label">01 / enter transparently</div><h2 className="panel-title">Join the<br />giveaway list.</h2></div>
        <div className="status-pill" data-testid="status-entry-open"><span className="status-dot" /> accepting entries</div>
      </div>
      <p className="panel-blurb" data-testid="text-entry-intro">Use a number we can reach, tell us where you are, and choose your network. Nothing is charged and carrier fulfillment is not connected yet.</p>

      <form onSubmit={onSubmit} noValidate data-testid="form-giveaway-entry">
        <label className="field-label" htmlFor="phone-input">Nigerian phone number</label>
        <div className={`phone-field ${errors.phoneNumber ? 'has-error' : ''}`}>
          <span className="phone-prefix">+234</span>
          <input
            id="phone-input"
            className="phone-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="801 234 5678"
            value={phoneNumber}
            onChange={(event) => onPhone(event.target.value)}
            aria-invalid={Boolean(errors.phoneNumber)}
            aria-describedby={errors.phoneNumber ? 'phone-error' : 'phone-help'}
            data-testid="input-phone-number"
          />
        </div>
        <p id="phone-help" className="field-help" data-testid="text-phone-help">Mobile numbers only. We normalise the number before secure submission.</p>
        {errors.phoneNumber && <FieldError id="phone-error" message={errors.phoneNumber} />}

        <label className="field-label entry-state-label" htmlFor="state-select">Your state</label>
        <div className={`select-wrap ${errors.state ? 'has-error' : ''}`}>
          <select id="state-select" value={state} onChange={(event) => onState(event.target.value)} aria-invalid={Boolean(errors.state)} data-testid="select-state">
            <option value="">Select a Nigerian state</option>
            {states.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown className="select-chevron" size={17} />
        </div>
        {errors.state && <FieldError id="state-error" message={errors.state} />}

        <div className="field-label network-label">Your network</div>
        <div className="network-grid" role="group" aria-label="Choose your mobile network" data-testid="group-network-options">
          {networks.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`network-choice ${network === item.name ? 'active' : ''}`}
              onClick={() => onNetwork(item.name)}
              aria-pressed={network === item.name}
              data-testid={`button-network-${item.name.toLowerCase().replace('mobile', '')}`}
            >
              <span className="network-badge" style={{ background: item.color, color: item.name === 'MTN' ? '#173c2c' : '#fff' }}>{item.short}</span>
              <span><span className="network-name">{item.name}</span><span className="network-type">mobile data</span></span>
            </button>
          ))}
        </div>
        {errors.network && <FieldError id="network-error" message={errors.network} />}

        <div className="consent-stack" data-testid="group-consents">
          <label className={`consent-row ${errors.terms ? 'has-error' : ''}`} htmlFor="consent-terms">
            <input id="consent-terms" type="checkbox" checked={consentToTerms} onChange={(event) => onTerms(event.target.checked)} data-testid="checkbox-consent-terms" />
            <span>I agree to the giveaway terms and privacy notice.</span>
          </label>
          {errors.terms && <FieldError id="terms-error" message={errors.terms} />}
          <label className={`consent-row ${errors.contact ? 'has-error' : ''}`} htmlFor="consent-contact">
            <input id="consent-contact" type="checkbox" checked={consentToContact} onChange={(event) => onContact(event.target.checked)} data-testid="checkbox-consent-contact" />
            <span>I allow the giveaway team to contact me about this entry.</span>
          </label>
          {errors.contact && <FieldError id="contact-error" message={errors.contact} />}
        </div>

        {serverMessage && (
          <div className="form-alert" role="alert" data-testid="status-entry-error">
            <CircleAlert size={15} /><span>{serverMessage}</span>
          </div>
        )}
        <button type="submit" className="cta" disabled={isPending} data-testid="button-submit-entry">
          <span>{isPending ? 'Saving your entry...' : 'Submit my entry'}</span>
          {isPending ? <span className="button-loader" aria-hidden="true" /> : <ArrowRight size={17} />}
        </button>
        <div className="tiny-safe" data-testid="text-submit-safety"><LockKeyhole size={13} /><span>No payment, forced sharing, or third-party redirect.</span></div>
      </form>

      <Disclosure />
    </article>
  );
}

function Disclosure() {
  return (
    <aside className="disclosure-card" data-testid="card-privacy-disclosure">
      <div className="disclosure-heading"><ShieldCheck size={15} /><span>Before you submit</span></div>
      <p data-testid="text-privacy-disclosure">We collect your phone number, state, network, and the two permissions above to record and follow up on this giveaway entry.</p>
      <div className="disclosure-points">
        <span data-testid="text-disclosure-retention"><strong>Use:</strong> entry review and giveaway-related contact only.</span>
        <span data-testid="text-disclosure-retention-detail"><strong>Retention:</strong> kept only as long as needed to manage the giveaway.</span>
        <span data-testid="text-disclosure-fulfillment"><strong>Important:</strong> carrier fulfillment is not connected yet, so this page cannot issue data.</span>
      </div>
    </aside>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return <p id={id} className="field-error" role="alert" data-testid={`error-${id}`}>{message}</p>;
}

function SuccessPanel({ entry, onReset }: { entry: GiveawayEntry; onReset: () => void }) {
  return (
    <article className="offer-panel success-panel" data-testid="card-entry-success">
      <div className="result-icon"><Check size={28} strokeWidth={3} /></div>
      <div className="panel-label">02 / entry received</div>
      <h2 className="result-title" data-testid="heading-entry-success">Your entry is<br />on the list.</h2>
      <p className="result-copy" data-testid="text-entry-success">Thanks for entering. Keep this reference for your records. It confirms receipt only; it is not a promise of a reward or carrier activation.</p>
      <div className="reference-card" data-testid="text-entry-reference">
        <span>entry reference</span>
        <strong>{entry.reference}</strong>
        <small data-testid="text-entry-status">Status: {entry.status}</small>
      </div>
      <button type="button" className="cta secondary" onClick={onReset} data-testid="button-new-entry">
        <span>Submit another entry</span><Sparkles size={16} />
      </button>
      <div className="tiny-safe" data-testid="text-success-follow-up"><ShieldCheck size={13} /><span>We will only use your details for the stated giveaway follow-up.</span></div>
      <AdBreak />
    </article>
  );
}

function AdBreak() {
  return (
    <aside className="ad-break" aria-label="Advertisements" data-testid="panel-ads">
      <div className="ad-break-head">
        <div className="ad-break-title"><Megaphone size={14} /><span>Advertisements</span></div>
      </div>
      <p className="ad-break-copy" data-testid="text-ad-disclosure">
        Sponsored placements from our ad partners.
      </p>
      <div className="ad-slot-grid">
        <LiveAdSlot format="native" label="Adsterra native banner" testId="slot-adsterra-native" />
        <LiveAdSlot format="banner" label="Adsterra banner" testId="slot-adsterra-banner" />
        <a
          className="ad-slot ad-link"
          data-ad-provider="monetag"
          href="https://omg10.com/4/11768279"
          target="_blank"
          rel="noopener noreferrer sponsored"
          data-testid="link-monetag-ad"
        >
          <span className="ad-slot-label">Advertisement</span>
          <strong>Monetag sponsored link</strong>
          <small>Opens in a new tab.</small>
        </a>
      </div>
    </aside>
  );
}

function LiveAdSlot({
  format,
  label,
  testId,
}: {
  format: 'native' | 'banner';
  label: string;
  testId: string;
}) {
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = slotRef.current;
    if (!root) return;
    root.replaceChildren();

    if (format === 'native') {
      const loader = document.createElement('script');
      loader.async = true;
      loader.setAttribute('data-cfasync', 'false');
      loader.src = 'https://pl31366337.profitableratecpmnetwork.com/f449c18cc707c8375ce4325ef2aa3dc7/invoke.js';

      const container = document.createElement('div');
      container.id = 'container-f449c18cc707c8375ce4325ef2aa3dc7';
      root.append(loader, container);
    } else {
      const options = document.createElement('script');
      options.text = `window.atOptions = {
        key: 'a7f4e34826932c9423a4267bb6cd3c08',
        format: 'iframe',
        height: 60,
        width: 468,
        params: {}
      };`;

      const loader = document.createElement('script');
      loader.src = 'https://www.highrevenueformat.com/a7f4e34826932c9423a4267bb6cd3c08/invoke.js';
      root.append(options, loader);
    }

    return () => root.replaceChildren();
  }, [format]);

  return (
    <div className="ad-slot ad-slot-live" data-ad-provider="adsterra" data-testid={testId}>
      <span className="ad-slot-label">Advertisement</span>
      <strong>{label}</strong>
      <div ref={slotRef} className="ad-embed" aria-label={`${label} content`} />
    </div>
  );
}

function CommentRow({ comment, onLike, onReply }: { comment: Comment; onLike: () => void; onReply: () => void }) {
  return (
    <div className="comment-row" data-testid={`comment-${comment.id}`}>
      <div className="avatar" style={{ background: comment.color }} data-testid={`avatar-comment-${comment.id}`}>{comment.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
      <div>
        <div className="comment-bubble">
          <span className="comment-name" data-testid={`text-comment-name-${comment.id}`}>{comment.name}</span><span className="comment-location"><MapPin size={9} style={{ display: 'inline', verticalAlign: 'middle' }} /> {comment.location}</span>
          <p className="comment-text" data-testid={`text-comment-${comment.id}`}>{comment.text}</p>
          {comment.image && <img className="comment-image" src={comment.image} alt="User attached local image" data-testid={`img-comment-${comment.id}`} />}
        </div>
        <div className="comment-tools">
          <button type="button" className={comment.liked ? 'active' : ''} onClick={onLike} data-testid={`button-like-comment-${comment.id}`}><Heart size={11} fill={comment.liked ? 'currentColor' : 'none'} /> Like {comment.likes}</button>
          <button type="button" onClick={onReply} data-testid={`button-reply-comment-${comment.id}`}>Reply {comment.replies}</button>
          <span data-testid={`text-comment-time-${comment.id}`}>now</span>
        </div>
      </div>
    </div>
  );
}

export default App;
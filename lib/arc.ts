// The one Arc card renderer. spec/arc-card.json + src/arc-card.js are the source of truth and are not modified.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ArcCard = require('../src/arc-card.js');
import tokens from '../spec/arc-card.json';

const arc = ArcCard.create(tokens);

export function arcSvg(handle: string, idPrefix: string): string {
  return arc.svg({
    handle: handle || 'yourhandle',
    date: '14/11/26',
    members: arc.sampleMembers(5),
    idPrefix,
  });
}

export function cleanHandle(raw: string): string {
  return raw.trim().replace(/^@/, '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 15).toLowerCase();
}

const SPEC_URL = 'https://github.com/erthxn/CirclePay/blob/main/spec/arc-card.md';

export function promptFor(handle: string): string {
  return (
    'Use CirclePay to find who showed up for ' + (handle ? '@' + handle : 'an X handle') + ' in the last 7 days (replies, quotes and reposts of their posts) and make a CirclePay circle card. ' +
    (handle ? 'The X handle is @' + handle + '. ' : 'Ask me for the X handle first. ') +
    'Show the result first and keep the chat short. ' +
    'Render the CirclePay Arc card exactly as described in ' + SPEC_URL + '. ' +
    'Do not pay anyone. Only offer an optional PayBox payout afterwards, and wait for my clear yes before anything is sent.'
  );
}

export function grokUrl(handle: string): string {
  return 'https://grok.com/?q=' + encodeURIComponent(promptFor(handle));
}

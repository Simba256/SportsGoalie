import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { holdForReRecord } from '../../helpers/re-record-hold';
import {
  COACH_AUDIO_CATALOGUE,
  isHeldForReRecord,
  playableClips,
  type CoachAudioClip,
} from '@/types/coach-audio';

// Every take in the first folder was uploaded on 13 September.
const FIRST_FOLDER_UPLOAD = new Date('2026-09-13T15:00:00Z');
const NEW_TAKE_UPLOAD = new Date('2026-10-02T09:00:00Z');

// The shipped catalogue holds nothing now, so these tests hold four lines
// themselves, as the four that were held before the 29 September takes arrived.
const HELD_IDS = ['V-A-01', 'V-A-02', 'V-A-05', 'V-A-10'];
const CUTOFF = '2026-09-14T00:00:00Z';

let release: () => void;

beforeEach(() => {
  release = holdForReRecord(HELD_IDS, CUTOFF);
});

afterEach(() => {
  release();
});

function clip(id: string, uploadedAt: Date): CoachAudioClip {
  return {
    id,
    url: `https://storage.example/${id}.mp3`,
    storagePath: `coach-audio/${id}.mp3`,
    contentType: 'audio/mpeg',
    sizeBytes: 48_000,
    durationSeconds: 6,
    originalFilename: `${id}.mp3`,
    uploadedAt,
    updatedAt: uploadedAt,
  };
}

describe('re-record hold — which takes stay silent', () => {
  it('gives every hold a cutoff that parses and a reason to show the admin', () => {
    for (const entry of COACH_AUDIO_CATALOGUE.filter(e => e.reRecord)) {
      expect(Number.isNaN(Date.parse(entry.reRecord!.heldBefore)), entry.id).toBe(false);
      expect(entry.reRecord!.reason.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('keeps the take from the first folder silent', () => {
    for (const id of HELD_IDS) {
      expect(isHeldForReRecord(clip(id, FIRST_FOLDER_UPLOAD)), id).toBe(true);
    }
  });

  it('plays a new take as soon as it is uploaded, with no code change', () => {
    for (const id of HELD_IDS) {
      expect(isHeldForReRecord(clip(id, NEW_TAKE_UPLOAD)), id).toBe(false);
    }
  });

  it('holds nothing once the holds are lifted, however old the take', () => {
    release();
    for (const id of HELD_IDS) {
      expect(isHeldForReRecord(clip(id, FIRST_FOLDER_UPLOAD)), id).toBe(false);
    }
  });

  it('counts a take uploaded at the cutoff itself as new', () => {
    expect(isHeldForReRecord(clip('V-A-01', new Date('2026-09-14T00:00:00Z')))).toBe(false);
    expect(isHeldForReRecord(clip('V-A-01', new Date('2026-09-13T23:59:59Z')))).toBe(true);
  });

  it('never holds a line that is not being re-recorded, however old the take', () => {
    expect(isHeldForReRecord(clip('V-A-03', FIRST_FOLDER_UPLOAD))).toBe(false);
    expect(isHeldForReRecord(clip('V-B-01', new Date('2020-01-01T00:00:00Z')))).toBe(false);
  });

  it('holds a take whose upload date cannot be read — silence is the safer mistake', () => {
    expect(isHeldForReRecord(clip('V-A-01', new Date('not a date')))).toBe(true);
  });
});

describe('playableClips', () => {
  it('drops the held takes and keeps everything else', () => {
    const onFile = {
      'V-A-01': clip('V-A-01', FIRST_FOLDER_UPLOAD),
      'V-A-02': clip('V-A-02', NEW_TAKE_UPLOAD),
      'V-A-03': clip('V-A-03', FIRST_FOLDER_UPLOAD),
      'V-A-10': clip('V-A-10', FIRST_FOLDER_UPLOAD),
      'V-B-05': clip('V-B-05', FIRST_FOLDER_UPLOAD),
    };

    expect(Object.keys(playableClips(onFile)).sort()).toEqual(['V-A-02', 'V-A-03', 'V-B-05']);
  });

  it('leaves the record it was given alone', () => {
    const onFile = { 'V-A-01': clip('V-A-01', FIRST_FOLDER_UPLOAD) };
    playableClips(onFile);
    expect(Object.keys(onFile)).toEqual(['V-A-01']);
  });
});

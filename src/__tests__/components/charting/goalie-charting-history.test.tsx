import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GoalieChartingHistory } from '@/components/charting/GoalieChartingHistory';
import { chartingService, dynamicChartingService, formTemplateService } from '@/lib/database';

vi.mock('@/lib/database', () => ({
  chartingService: {
    getSessionsByStudent: vi.fn(),
    getChartingEntriesByStudent: vi.fn(),
  },
  dynamicChartingService: {
    getDynamicEntriesByStudent: vi.fn(),
    getAllDynamicEntries: vi.fn(),
  },
  formTemplateService: {
    getTemplates: vi.fn(),
    getTemplate: vi.fn(),
  },
}));

vi.mock('@/components/charting/V2ChartReadOnlyView', () => ({
  V2ChartReadOnlyView: () => <div data-testid="v2-view" />,
}));

const ok = <T,>(data: T) => ({ success: true, data, timestamp: new Date() });

const template = { id: 'tpl-game', name: 'Game Performance', sections: [] };

const gameCheckIn = (id: string, isComplete: boolean) => ({
  id,
  studentId: 'tony',
  formTemplateId: 'tpl-game',
  submittedAt: { toDate: () => new Date('2026-10-16T14:30:00') },
  responses: {},
  isComplete,
  completionPercentage: isComplete ? 100 : 40,
});

const loggedGame = {
  id: 'session-1',
  studentId: 'tony',
  type: 'game',
  date: { toDate: () => new Date('2026-08-02T10:00:00') },
  opponent: 'Rivals',
};

/**
 * 16 Oct: Tony charted two games through Pillar Check-Ins. The goalie's own page
 * said "2 check-ins"; the coach's View Charts and the admin's Charting tab said
 * "No charting history yet", because this history only read logged sessions.
 */
describe('GoalieChartingHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chartingService.getSessionsByStudent).mockResolvedValue(ok([]) as never);
    vi.mocked(chartingService.getChartingEntriesByStudent).mockResolvedValue(ok([]) as never);
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(ok([]) as never);
    vi.mocked(formTemplateService.getTemplates).mockResolvedValue(ok([template]) as never);
    vi.mocked(formTemplateService.getTemplate).mockResolvedValue({ success: false } as never);
  });

  it('lists a goalie\'s pillar check-ins when there is no logged session', async () => {
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(
      ok([gameCheckIn('c1', true), gameCheckIn('c2', false)]) as never
    );

    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByText(/Pillar check-ins · 2/)).toBeInTheDocument();
    expect(screen.getAllByText('Game Performance')).toHaveLength(2);
    expect(screen.queryByText('No charting history yet')).not.toBeInTheDocument();
  });

  it('names each check-in by the chart it was answered on, and marks complete and partial', async () => {
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(
      ok([gameCheckIn('c1', true), gameCheckIn('c2', false)]) as never
    );

    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByText('✓ Complete')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('reads check-ins by the goalie, not every goalie', async () => {
    render(<GoalieChartingHistory studentId="tony" />);
    await screen.findByText('No charting history yet');

    expect(dynamicChartingService.getDynamicEntriesByStudent).toHaveBeenCalledWith('tony');
    expect(dynamicChartingService.getAllDynamicEntries).not.toHaveBeenCalled();
  });

  it('opens a check-in to its answers, and closes it again', async () => {
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(ok([gameCheckIn('c1', true)]) as never);

    render(<GoalieChartingHistory studentId="tony" />);
    const row = await screen.findByRole('button', { name: /Game Performance/ });

    expect(row).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('says so when the chart a check-in was answered on is gone', async () => {
    vi.mocked(formTemplateService.getTemplates).mockResolvedValue(ok([]) as never);
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(ok([gameCheckIn('c1', true)]) as never);

    render(<GoalieChartingHistory studentId="tony" />);
    const row = await screen.findByRole('button', { name: /Pillar chart/ });
    fireEvent.click(row);

    expect(screen.getByText(/can no longer be found/)).toBeInTheDocument();
  });

  it('asks for a template again when the list does not include it', async () => {
    vi.mocked(formTemplateService.getTemplates).mockResolvedValue(ok([]) as never);
    vi.mocked(formTemplateService.getTemplate).mockResolvedValue(ok(template) as never);
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(ok([gameCheckIn('c1', true)]) as never);

    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByRole('button', { name: /Game Performance/ })).toBeInTheDocument();
    expect(formTemplateService.getTemplate).toHaveBeenCalledWith('tpl-game');
  });

  it('still shows the empty state when the goalie has neither sessions nor check-ins', async () => {
    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByText('No charting history yet')).toBeInTheDocument();
    expect(screen.getByText(/pillar check-in, it will appear here/)).toBeInTheDocument();
  });

  it('shows the empty state, not an error, when the check-ins fail to load', async () => {
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockRejectedValue(new Error('permission-denied'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByText('No charting history yet')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('keeps logged games and shows check-ins above them when the goalie has both', async () => {
    vi.mocked(chartingService.getSessionsByStudent).mockResolvedValue(ok([loggedGame]) as never);
    vi.mocked(chartingService.getChartingEntriesByStudent).mockResolvedValue(
      ok([{ id: 'e1', sessionId: 'session-1', studentId: 'tony', v2PreGame: { a: 1 }, v2Periods: {}, v2PostGame: {} }]) as never
    );
    vi.mocked(dynamicChartingService.getDynamicEntriesByStudent).mockResolvedValue(ok([gameCheckIn('c1', true)]) as never);

    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByText(/Pillar check-ins · 1/)).toBeInTheDocument();
    expect(screen.getByText(/Games and practices · 1/)).toBeInTheDocument();
    expect(screen.getByText(/Rivals/)).toBeInTheDocument();
  });

  it('keeps showing only logged games when there are no check-ins', async () => {
    vi.mocked(chartingService.getSessionsByStudent).mockResolvedValue(ok([loggedGame]) as never);
    vi.mocked(chartingService.getChartingEntriesByStudent).mockResolvedValue(
      ok([{ id: 'e1', sessionId: 'session-1', studentId: 'tony', v2PreGame: { a: 1 }, v2Periods: {}, v2PostGame: {} }]) as never
    );

    render(<GoalieChartingHistory studentId="tony" />);

    expect(await screen.findByText(/Rivals/)).toBeInTheDocument();
    expect(screen.queryByText(/Pillar check-ins/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Games and practices/)).not.toBeInTheDocument();
  });
});

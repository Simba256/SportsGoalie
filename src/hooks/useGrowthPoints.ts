'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  growthPointsService,
  GrowthPointsBalance,
  GrowthPointsTransaction,
  GrowthPointsEventType,
} from '@/lib/firebase/growth-points.service';

export function useGrowthPoints() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<GrowthPointsBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const b = await growthPointsService.getBalance(user.id);
      setBalance(b);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const awardPoints = useCallback(
    async (
      eventType: GrowthPointsEventType,
      points: number,
      description: string,
      referenceId?: string
    ): Promise<void> => {
      if (!user?.id) return;
      await growthPointsService.awardPoints(user.id, eventType, points, description, referenceId);
      await fetchBalance();
    },
    [user?.id, fetchBalance]
  );

  const awardPointsOnce = useCallback(
    async (
      eventType: GrowthPointsEventType,
      points: number,
      description: string,
      referenceId: string
    ): Promise<boolean> => {
      if (!user?.id) return false;
      const awarded = await growthPointsService.awardPointsOnce(
        user.id,
        eventType,
        points,
        description,
        referenceId
      );
      if (awarded) await fetchBalance();
      return awarded;
    },
    [user?.id, fetchBalance]
  );

  return {
    balance,
    currentPoints: balance?.currentBalance ?? 0,
    lifetimeEarned: balance?.lifetimeEarned ?? 0,
    loading,
    awardPoints,
    awardPointsOnce,
    refresh: fetchBalance,
  };
}

export function useGrowthPointsTransactions(limitCount = 50) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<GrowthPointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    growthPointsService
      .getTransactions(user.id, limitCount)
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [user?.id, limitCount]);

  return { transactions, loading };
}

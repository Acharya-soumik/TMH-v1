import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useVoter() {
  const [token, setToken] = useState<string>('');
  const [votes, setVotes] = useState<Record<number, number>>({});

  useEffect(() => {
    let t = localStorage.getItem('tmh_voter_token');
    if (!t) {
      t = uuidv4();
      localStorage.setItem('tmh_voter_token', t);
    }
    setToken(t);

    const v = localStorage.getItem('tmh_votes');
    if (v) {
      try {
        setVotes(JSON.parse(v));
      } catch (e) {
        console.error("Failed to parse votes");
      }
    }
  }, []);

  const recordVote = (pollId: number, optionId: number) => {
    const newVotes = { ...votes, [pollId]: optionId };
    setVotes(newVotes);
    localStorage.setItem('tmh_votes', JSON.stringify(newVotes));
  };

  const hasVoted = (pollId: number) => {
    return !!votes[pollId];
  };

  const getVotedOption = (pollId: number) => {
    return votes[pollId];
  };

  return { token, votes, recordVote, hasVoted, getVotedOption };
}

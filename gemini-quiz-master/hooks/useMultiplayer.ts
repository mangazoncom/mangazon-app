import { useState, useEffect, useRef, useCallback } from 'react';
import { joinRoom } from 'trystero';
import { Player, Question, QuizConfig } from '../types';

const APP_ID = 'gemini_quiz_master_v1';

type ActionType = 
  | { type: 'HELLO'; payload: { name: string; isHost: boolean } }
  | { type: 'SYNC_PLAYERS'; payload: { players: Player[] } }
  | { type: 'START_GAME'; payload: { questions: Question[]; config: QuizConfig } }
  | { type: 'UPDATE_PROGRESS'; payload: { id: string; score: number; index: number; finished: boolean } };

export const useMultiplayer = () => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomAction, setRoomAction] = useState<any>(null); // Trystero action sender
  const [gameStartData, setGameStartData] = useState<{ questions: Question[]; config: QuizConfig } | null>(null);

  // Refs to access latest state in callbacks
  const playersRef = useRef<Player[]>([]);
  const myPlayerRef = useRef<Partial<Player>>({});

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const connect = useCallback((roomIdInput: string, name: string, isHost: boolean) => {
    const room = joinRoom({ appId: APP_ID }, roomIdInput);
    const [sendAction, getAction] = room.makeAction<ActionType>('game_action');
    
    setRoomAction(() => sendAction);
    setRoomId(roomIdInput);

    // Initial self player setup
    // Note: Trystero doesn't give us our own ID synchronously easily in all modes, 
    // but selfId is available on the room object.
    const selfId = room.selfId;
    setMyId(selfId);
    
    const me: Player = {
      id: selfId,
      name,
      isHost,
      score: 0,
      currentQuestionIndex: 0,
      finished: false
    };
    myPlayerRef.current = me;
    setPlayers([me]);

    // Handle incoming actions
    getAction((data, peerId) => {
      switch (data.type) {
        case 'HELLO':
          handlePlayerJoin(peerId, data.payload.name, data.payload.isHost, isHost, sendAction);
          break;
        case 'SYNC_PLAYERS':
          if (!isHost) {
            // Guests accept the host's player list as truth (merging self to ensure no overwrite issues)
            setPlayers(data.payload.players);
          }
          break;
        case 'START_GAME':
          setGameStartData(data.payload);
          break;
        case 'UPDATE_PROGRESS':
          setPlayers(prev => prev.map(p => 
            p.id === data.payload.id 
              ? { ...p, score: data.payload.score, currentQuestionIndex: data.payload.index, finished: data.payload.finished }
              : p
          ));
          break;
      }
    });

    // When a peer joins (Trystero event), we expect them to send HELLO next
    room.onPeerJoin((peerId) => {
      console.log(`Peer ${peerId} joined`);
    });

    // Handle peer leave
    room.onPeerLeave((peerId) => {
      setPlayers(prev => prev.filter(p => p.id !== peerId));
    });

    // Broadcast HELLO to existing peers
    sendAction({ type: 'HELLO', payload: { name, isHost } });

    return () => {
      room.leave();
    };
  }, []);

  const handlePlayerJoin = (
    peerId: string, 
    name: string, 
    isRemoteHost: boolean, 
    isLocalHost: boolean,
    sendAction: any
  ) => {
    // Add the new player
    const newPlayer: Player = {
      id: peerId,
      name,
      isHost: isRemoteHost,
      score: 0,
      currentQuestionIndex: 0,
      finished: false
    };

    setPlayers(prev => {
      // Avoid duplicates
      if (prev.some(p => p.id === peerId)) return prev;
      const updated = [...prev, newPlayer];
      
      // If I am the host, I immediately sync the full list to everyone to keep consistency
      if (isLocalHost) {
        setTimeout(() => {
          sendAction({ type: 'SYNC_PLAYERS', payload: { players: updated } });
        }, 100);
      }
      return updated;
    });
  };

  const startGame = (questions: Question[], config: QuizConfig) => {
    if (roomAction) {
      roomAction({ type: 'START_GAME', payload: { questions, config } });
    }
  };

  const updateProgress = (score: number, index: number, finished: boolean) => {
    if (roomAction && myId) {
      // Update local state first
      setPlayers(prev => prev.map(p => 
        p.id === myId 
          ? { ...p, score, index, finished }
          : p
      ));
      // Broadcast
      roomAction({ type: 'UPDATE_PROGRESS', payload: { id: myId, score, index, finished } });
    }
  };

  return {
    connect,
    players,
    myId,
    startGame,
    updateProgress,
    gameStartData,
    roomId
  };
};

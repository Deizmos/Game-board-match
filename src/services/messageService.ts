import { supabase, Database } from './supabase';

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export interface MessageWithSender extends Message {
  sender: Database['public']['Tables']['users']['Row'];
}

export class MessageService {
  /**
   * Отправка сообщения
   */
  static async sendMessage(
    matchId: string,
    senderId: string,
    content: string
  ): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content: content.trim(),
        })
        .select()
        .single();

      return { message, error };
    } catch (error) {
      return { message: null, error: error as Error };
    }
  }

  /**
   * Получение сообщений матча
   */
  static async getMatchMessages(
    matchId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ messages: MessageWithSender[]; error: Error | null }> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .eq('match_id', matchId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      return { messages: messages || [], error };
    } catch (error) {
      return { messages: [], error: error as Error };
    }
  }

  /**
   * Получение последних сообщений матча
   */
  static async getLastMessages(
    matchId: string,
    limit: number = 20
  ): Promise<{ messages: MessageWithSender[]; error: Error | null }> {
    return this.getMatchMessages(matchId, limit, 0);
  }

  /**
   * Отметка сообщений как прочитанных
   */
  static async markMessagesAsRead(
    matchId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', userId);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Получение количества непрочитанных сообщений
   */
  static async getUnreadCount(userId: string): Promise<{ count: number; error: Error | null }> {
    try {
      // Получаем все матчи пользователя
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .in('status', ['pending', 'accepted']);

      if (matchesError) {
        return { count: 0, error: matchesError };
      }

      if (!matches || matches.length === 0) {
        return { count: 0, error: null };
      }

      const matchIds = matches.map(m => m.id);

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('match_id', matchIds)
        .eq('is_read', false)
        .neq('sender_id', userId);

      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error: error as Error };
    }
  }

  /**
   * Получение непрочитанных сообщений по матчам
   */
  static async getUnreadMessagesByMatch(userId: string): Promise<{
    unreadByMatch: Record<string, number>;
    error: Error | null;
  }> {
    try {
      // Получаем все матчи пользователя
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .in('status', ['pending', 'accepted']);

      if (matchesError) {
        return { unreadByMatch: {}, error: matchesError };
      }

      if (!matches || matches.length === 0) {
        return { unreadByMatch: {}, error: null };
      }

      const matchIds = matches.map(m => m.id);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('match_id')
        .in('match_id', matchIds)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        return { unreadByMatch: {}, error };
      }

      // Подсчитываем непрочитанные сообщения по матчам
      const unreadByMatch: Record<string, number> = {};
      messages?.forEach(message => {
        const matchId = message.match_id;
        unreadByMatch[matchId] = (unreadByMatch[matchId] || 0) + 1;
      });

      return { unreadByMatch, error: null };
    } catch (error) {
      return { unreadByMatch: {}, error: error as Error };
    }
  }

  /**
   * Удаление сообщения
   */
  static async deleteMessage(messageId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Редактирование сообщения
   */
  static async editMessage(
    messageId: string,
    content: string
  ): Promise<{ message: Message | null; error: Error | null }> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .update({ content: content.trim() })
        .eq('id', messageId)
        .select()
        .single();

      return { message, error };
    } catch (error) {
      return { message: null, error: error as Error };
    }
  }

  /**
   * Подписка на новые сообщения в матче
   */
  static subscribeToMatchMessages(
    matchId: string,
    onMessage: (message: MessageWithSender) => void,
    onError?: (error: Error) => void
  ) {
    return supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          try {
            const { data: message, error } = await supabase
              .from('messages')
              .select(`
                *,
                sender:users!messages_sender_id_fkey(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              onError?.(error);
              return;
            }

            onMessage(message);
          } catch (error) {
            onError?.(error as Error);
          }
        }
      )
      .subscribe();
  }

  /**
   * Отписка от сообщений матча
   */
  static unsubscribeFromMatchMessages(subscription: any) {
    return supabase.removeChannel(subscription);
  }

  /**
   * Получение сообщения по ID
   */
  static async getMessageById(messageId: string): Promise<{ message: MessageWithSender | null; error: Error | null }> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .eq('id', messageId)
        .single();

      return { message, error };
    } catch (error) {
      return { message: null, error: error as Error };
    }
  }
}

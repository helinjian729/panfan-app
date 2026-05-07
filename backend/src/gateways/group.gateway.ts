import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/groups',
})
export class GroupGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GroupGateway');

  // 存储用户与socket的映射
  private userSockets = new Map<string, string>();
  // 存储socket与用户的映射
  private socketUsers = new Map<string, string>();
  // 存储拼饭团房间
  private groupRooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // 清理映射
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);
    }

    // 离开所有房间
    this.groupRooms.forEach((clients, groupId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        // 通知房间内其他成员
        this.server.to(groupId).emit('member_leave', {
          groupId,
          socketId: client.id,
          userId,
        });
      }
    });
  }

  // 用户认证
  @SubscribeMessage('auth')
  handleAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.userSockets.set(data.userId, client.id);
    this.socketUsers.set(client.id, data.userId);
    client.emit('auth_success', { userId: data.userId });
    this.logger.log(`User ${data.userId} authenticated`);
  }

  // 加入拼饭团房间
  @SubscribeMessage('join_group')
  handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; userId: string },
  ) {
    const { groupId, userId } = data;

    // 加入房间
    client.join(groupId);

    // 记录房间成员
    if (!this.groupRooms.has(groupId)) {
      this.groupRooms.set(groupId, new Set());
    }
    this.groupRooms.get(groupId).add(client.id);

    // 更新用户socket映射
    this.userSockets.set(userId, client.id);
    this.socketUsers.set(client.id, userId);

    // 通知房间内其他成员
    client.to(groupId).emit('member_join', {
      groupId,
      userId,
      socketId: client.id,
    });

    this.logger.log(`User ${userId} joined group ${groupId}`);
  }

  // 离开拼饭团房间
  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; userId: string },
  ) {
    const { groupId, userId } = data;

    client.leave(groupId);

    // 更新房间成员
    const room = this.groupRooms.get(groupId);
    if (room) {
      room.delete(client.id);
    }

    // 通知房间内其他成员
    client.to(groupId).emit('member_leave', {
      groupId,
      userId,
      socketId: client.id,
    });

    this.logger.log(`User ${userId} left group ${groupId}`);
  }

  // 广播菜品添加
  @SubscribeMessage('item_added')
  handleItemAdded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; item: any },
  ) {
    client.to(data.groupId).emit('item_added', {
      groupId: data.groupId,
      item: data.item,
    });
  }

  // 广播菜品删除
  @SubscribeMessage('item_removed')
  handleItemRemoved(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; itemId: string },
  ) {
    client.to(data.groupId).emit('item_removed', {
      groupId: data.groupId,
      itemId: data.itemId,
    });
  }

  // 广播拼饭团状态变更
  @SubscribeMessage('group_status_change')
  handleGroupStatusChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; status: string },
  ) {
    this.server.to(data.groupId).emit('group_status_change', {
      groupId: data.groupId,
      status: data.status,
    });
  }

  // 广播购物车更新
  @SubscribeMessage('cart_update')
  handleCartUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string; cart: any },
  ) {
    client.to(data.groupId).emit('cart_update', {
      groupId: data.groupId,
      cart: data.cart,
    });
  }

  // 发送消息给特定用户
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // 发送消息给拼饭团所有成员
  sendToGroup(groupId: string, event: string, data: any) {
    this.server.to(groupId).emit(event, data);
  }
}

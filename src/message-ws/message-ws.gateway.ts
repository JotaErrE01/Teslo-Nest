import { Get } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessageWsService } from './message-ws.service';

export let dataSocket: Server | null = null;

@WebSocketGateway({ 
  cors: true,
})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService
  ) { }

  handleConnection(client: Socket) {
    this.messageWsService.registerClient(client);
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());
    dataSocket = this.wss;    
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client);
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  handleMessageFormClient(client: Socket, payload: NewMessageDto): void {
    client.emit('message-from-server', {
      fullName: 'Server',
      message: payload.message || 'NO MESSAGE'
    });
  }

  // create a global socket service
  get SocketService() {
    return this.wss;
  }
}

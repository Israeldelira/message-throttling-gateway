import { Column, Entity, PrimaryColumn } from 'typeorm';
import { MessageStatus } from '../enums/message-status.enum';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  recipient!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.RECEIVED,
  })
  status!: MessageStatus;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  attempts!: number;

  @Column({
    name: 'error_detail',
    type: 'text',
    nullable: true,
  })
  errorDetail!: string | null;

  @Column({
    name: 'received_at',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  receivedAt!: Date;

  @Column({
    name: 'last_attempt_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  lastAttemptAt!: Date | null;

  @Column({ name: 'sent_at', type: 'datetime', precision: 3, nullable: true })
  sentAt!: Date | null;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt!: Date;
}

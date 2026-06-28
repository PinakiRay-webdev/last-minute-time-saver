import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    description: string;
    priorityScore: number;
    aiActionType: string;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
    aiOutput?: string;
    suggestedStartDateTime: string | null;
    suggestedEndDateTime: string | null;
    isBlockingEvent: boolean;
}

const taskSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    priorityScore: {
        type: Number,
        default: 5,
    },
    aiActionType: {
        type: String,
        enum: ['draft_email', 'summarize_doc', 'breakdown_tasks', 'create_explanation', 'research', 'default'],
        default: 'default',
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    aiOutput: {
        type: String,
        default: ""
    },
    suggestedStartDateTime: {
        type: String,
        default: null,
    },
    suggestedEndDateTime: {
        type: String,
        default: null,
    },
    isBlockingEvent: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

const TASK = mongoose.model<ITask>('TASK', taskSchema);

export default TASK;
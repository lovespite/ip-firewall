import mongoose, {Schema} from "mongoose";

export interface Messages extends mongoose.Document {
    src_ip: string;
    last_updated: Date;
    data: string[];
    count: number;
    blocked: boolean;
    country: string;
    area: string;
}

const MessageSchema = new mongoose.Schema({
    src_ip: {type: String, required: true, unique: true, primaryKey: true},
    last_updated: {type: Date, required: true},
    data: {type: [String], required: false, default: []},
    count: {type: Number, required: false, default: 1},
    blocked: {type: Boolean, required: false, default: false},
    country: {type: String, required: false, default: ''},
    area: {type: String, required: false, default: ''},
});

export default mongoose.models.Message || mongoose.model<Messages>('Message', MessageSchema);
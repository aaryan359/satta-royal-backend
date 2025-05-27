import mongoose from 'mongoose';
import { IRegion } from '../types/Region';


const RegionSchema = new mongoose.Schema<IRegion>({
    name: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RegionModel = mongoose.model<IRegion>('Region', RegionSchema);
export default RegionModel;
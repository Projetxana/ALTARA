import { supabase } from '../../lib/supabase';

export function mapCalendarBlockFromDb(row) {
    if (!row) return null;

    return {
        id: row.id,
        chaletId: row.chalet_id,
        userId: row.user_id,

        blockType: row.block_type,

        startDate: row.start_date,
        endDate: row.end_date,

        guestName: row.guest_name || '',
        guestEmail: row.guest_email || '',
        guestPhone: row.guest_phone || '',

        note: row.note || '',
        expiresAt: row.expires_at || null,

        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

async function getAuthenticatedUser() {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
        throw new Error(
            'CalendarBlockService: authentication required.'
        );
    }

    return user;
}

function validateBlock(block) {
    if (!block?.chaletId) {
        throw new Error('chaletId is required.');
    }

    if (!block?.startDate || !block?.endDate) {
        throw new Error(
            'startDate and endDate are required.'
        );
    }

    if (block.endDate <= block.startDate) {
        throw new Error(
            'End date must be after start date.'
        );
    }

    const allowedTypes = [
        'owner',
        'maintenance',
        'guest_hold',
        'other'
    ];

    if (!allowedTypes.includes(block.blockType)) {
        throw new Error('Invalid block type.');
    }
}

const CalendarBlockService = {
    async createBlock(blockData) {
        validateBlock(blockData);

        const user = await getAuthenticatedUser();

        const row = {
            user_id: user.id,
            chalet_id: blockData.chaletId,

            block_type: blockData.blockType,

            start_date: blockData.startDate,
            end_date: blockData.endDate,

            guest_name:
                blockData.guestName?.trim() || null,

            guest_email:
                blockData.guestEmail?.trim() || null,

            guest_phone:
                blockData.guestPhone?.trim() || null,

            note:
                blockData.note?.trim() || null,

            expires_at:
                blockData.expiresAt || null
        };

        const { data, error } = await supabase
            .from('calendar_blocks')
            .insert(row)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Unable to create calendar block: ${error.message}`
            );
        }

        return mapCalendarBlockFromDb(data);
    },

    async getBlocksForChalet(chaletId) {
        const { data, error } = await supabase
            .from('calendar_blocks')
            .select('*')
            .eq('chalet_id', chaletId)
            .order('start_date');

        if (error) {
            throw new Error(
                `Unable to load calendar blocks: ${error.message}`
            );
        }

        return (data || []).map(
            mapCalendarBlockFromDb
        );
    },

    async updateBlock(blockId, changes) {
        if (!blockId) {
            throw new Error('blockId is required.');
        }

        const patch = {};

        if (changes.blockType !== undefined) {
            patch.block_type = changes.blockType;
        }

        if (changes.startDate !== undefined) {
            patch.start_date = changes.startDate;
        }

        if (changes.endDate !== undefined) {
            patch.end_date = changes.endDate;
        }

        if (changes.guestName !== undefined) {
            patch.guest_name =
                changes.guestName?.trim() || null;
        }

        if (changes.guestEmail !== undefined) {
            patch.guest_email =
                changes.guestEmail?.trim() || null;
        }

        if (changes.guestPhone !== undefined) {
            patch.guest_phone =
                changes.guestPhone?.trim() || null;
        }

        if (changes.note !== undefined) {
            patch.note =
                changes.note?.trim() || null;
        }

        if (changes.expiresAt !== undefined) {
            patch.expires_at =
                changes.expiresAt || null;
        }

        const { data, error } = await supabase
            .from('calendar_blocks')
            .update(patch)
            .eq('id', blockId)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Unable to update calendar block: ${error.message}`
            );
        }

        return mapCalendarBlockFromDb(data);
    },

    async deleteBlock(blockId) {
        const { error } = await supabase
            .from('calendar_blocks')
            .delete()
            .eq('id', blockId);

        if (error) {
            throw new Error(
                `Unable to delete calendar block: ${error.message}`
            );
        }
    }
};

export default CalendarBlockService;

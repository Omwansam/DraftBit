const { prisma } = require('../config/db');
const { asyncHandler } = require('../utils/errors.util');
const { parse, line, int } = require('../utils/validate.util');

const listSchema = {
    limit: int({ min: 1, max: 200, default: 30 }),
    type: line(40),
};

/** The console's activity feed: newest first, capped so it cannot be used to dump the table. */
const list = asyncHandler(async (req, res) => {
    const { limit, type } = parse(listSchema, req.query);

    const rows = await prisma.activityLog.findMany({
        where: type ? { type } : {},
        orderBy: { at: 'desc' },
        take: limit,
        select: { id: true, actor: true, action: true, target: true, type: true, at: true },
    });

    res.json(rows);
});

module.exports = { list };

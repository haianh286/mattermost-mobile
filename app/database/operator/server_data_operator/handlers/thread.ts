// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Model from '@nozbe/watermelondb/Model';

import {Database} from '@constants';
import DataOperatorException from '@database/exceptions/data_operator_exception';
import {isRecordThreadEqualToRaw} from '@database/operator/server_data_operator/comparators';
import {
    transformThreadRecord,
    transformThreadParticipantRecord,
} from '@database/operator/server_data_operator/transformers/thread';
import {getUniqueRawsBy} from '@database/operator/utils/general';
import {sanitizeThreadParticipants} from '@database/operator/utils/thread';

import type {HandleThreadsArgs, HandleThreadParticipantsArgs, ProcessRecordResults} from '@typings/database/database';
import type ThreadModel from '@typings/database/models/servers/thread';
import type ThreadParticipantModel from '@typings/database/models/servers/thread_participant';

const {
    THREAD,
    THREAD_PARTICIPANT,
} = Database.MM_TABLES.SERVER;

export interface ThreadHandlerMix {
    handleThreads: ({threads, prepareRecordsOnly}: HandleThreadsArgs) => Promise<Model[]>;
    handleThreadParticipants: ({threadsParticipants, prepareRecordsOnly}: HandleThreadParticipantsArgs) => Promise<ThreadParticipantModel[]>;
}

const ThreadHandler = (superclass: any) => class extends superclass {
    /**
     * handleThreads: Handler responsible for the Create/Update operations occurring on the Thread table from the 'Server' schema
     * @param {HandleThreadsArgs} handleThreads
     * @param {Thread[]} handleThreads.threads
     * @param {boolean | undefined} handleThreads.prepareRecordsOnly
     * @returns {Promise<void>}
     */
    handleThreads = async ({threads, prepareRecordsOnly = false}: HandleThreadsArgs): Promise<Model[]> => {
        const tableName = THREAD;

        if (!threads.length) {
            throw new DataOperatorException(
                'An empty "threads" array has been passed to the handleThreads method',
            );
        }

        // Get unique threads in case they are duplicated
        const uniqueThreads = getUniqueRawsBy({
            raws: threads,
            key: 'id',
        }) as Thread[];

        const threadsParticipants: ParticipantsPerThread[] = [];

        // Let's process the thread data
        for (const thread of uniqueThreads) {
            threadsParticipants.push({
                thread_id: thread.id,
                participants: (thread.participants || []).map((participant) => ({
                    id: participant.id,
                    thread_id: thread.id,
                })),
            });
        }

        // Process the threads to get which ones need to be created and which updated
        const processedThreads = (await this.processRecords({
            createOrUpdateRawValues: uniqueThreads,
            tableName,
            findMatchingRecordBy: isRecordThreadEqualToRaw,
            fieldName: 'id',
        })) as ProcessRecordResults;

        const preparedThreads = (await this.prepareRecords({
            createRaws: processedThreads.createRaws,
            updateRaws: processedThreads.updateRaws,
            transformer: transformThreadRecord,
            tableName,
        })) as ThreadModel[];

        // Add the models to be batched here
        const batch: Model[] = [...preparedThreads];

        // calls handler for Thread Participants
        const threadParticipants = (await this.handleThreadParticipants({threadsParticipants, prepareRecordsOnly: true})) as ThreadParticipantModel[];
        batch.push(...threadParticipants);

        if (batch.length && !prepareRecordsOnly) {
            await this.batchRecords(batch);
        }

        return batch;
    };

    /**
     * handleThreadParticipants: Handler responsible for the Create/Update operations occurring on the ThreadParticipants table from the 'Server' schema
     * @param {HandleThreadParticipantsArgs} handleThreadParticipants
     * @param {ParticipantsPerThread[]} handleThreadParticipants.threadsParticipants
     * @param {boolean} handleThreadParticipants.prepareRecordsOnly
     * @throws DataOperatorException
     * @returns {Promise<Array<ThreadParticipantModel>>}
     */
    handleThreadParticipants = async ({threadsParticipants, prepareRecordsOnly}: HandleThreadParticipantsArgs): Promise<ThreadParticipantModel[]> => {
        const batchRecords: ThreadParticipantModel[] = [];

        if (!threadsParticipants.length) {
            throw new DataOperatorException(
                'An empty "thread participants" array has been passed to the handleThreadParticipants method',
            );
        }

        for await (const threadParticipant of threadsParticipants) {
            const {thread_id, participants} = threadParticipant;
            const rawValues = getUniqueRawsBy({raws: participants, key: 'id'}) as ThreadParticipant[];
            const {
                createParticipants,
                deleteParticipants,
            } = await sanitizeThreadParticipants({
                database: this.database,
                thread_id,
                rawParticipants: rawValues,
            });

            if (createParticipants?.length) {
                // Prepares record for model ThreadParticipants
                const participantsRecords = (await this.prepareRecords({
                    createRaws: createParticipants,
                    transformer: transformThreadParticipantRecord,
                    tableName: THREAD_PARTICIPANT,
                })) as ThreadParticipantModel[];
                batchRecords.push(...participantsRecords);
            }

            if (deleteParticipants?.length) {
                batchRecords.push(...deleteParticipants);
            }
        }

        if (prepareRecordsOnly) {
            return batchRecords;
        }

        if (batchRecords?.length) {
            await this.batchRecords(batchRecords);
        }

        return batchRecords;
    };
};

export default ThreadHandler;

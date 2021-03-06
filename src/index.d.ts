declare module 'discord-akairo' {
    import {
        BufferResolvable, Client, ClientOptions, Collection,
        Message, MessageAttachment, MessageEmbed,
        MessageAdditions, MessageEditOptions, MessageOptions,
        User, UserResolvable, GuildMember,
        Channel, Role, Emoji, Guild,
        PermissionResolvable, StringResolvable, Snowflake
    } from 'discord.js';

    import { Database, Statement } from 'sqlite';
    import { Model } from 'sequelize';
    import { EventEmitter } from 'events';
    import { Stream } from 'stream';

    module 'discord.js' {
        export interface Message {
            util?: CommandUtil;
        }
    }

    export class AkairoError extends Error {
        public code: string;
    }

    export class AkairoClient extends Client {
        public constructor(options?: AkairoOptions & ClientOptions, clientOptions?: ClientOptions);

        public ownerID: Snowflake | Snowflake[];
        public util: ClientUtil;

        public isOwner(user: UserResolvable): boolean;
    }

    export class AkairoHandler extends EventEmitter {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public automateCategories: boolean;
        public extensions: Set<string>;
        public categories: Collection<string, Category<string, AkairoModule>>;
        public classToHandle: Function;
        public client: AkairoClient;
        public directory: string;
        public loadFiler: LoadPredicate;
        public modules: Collection<string, AkairoModule>;

        public deregister(mod: AkairoModule): void;
        public findCategory(name: string): Category<string, AkairoModule>;
        public load(thing: string | Function, isReload?: boolean): AkairoModule;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(mod: AkairoModule, filepath?: string): void;
        public reload(id: string): AkairoModule;
        public reloadAll(): this;
        public remove(id: string): AkairoModule;
        public removeAll(): this;
        public on(event: 'remove', listener: (mod: AkairoModule) => any): this;
        public on(event: 'load', listener: (mod: AkairoModule, isReload: boolean) => any): this;

        public static readdirRecursive(directory: string): string[];
    }

    export class AkairoModule {
        public constructor(id: string, options?: AkairoModuleOptions);

        public category: Category<string, AkairoModule>;
        public categoryID: string;
        public client: AkairoClient;
        public filepath: string;
        public handler: AkairoHandler;
        public id: string;

        public reload(): this;
        public remove(): this;
    }

    export class Argument {
        public constructor(command: Command, options: ArgumentOptions);

        public readonly client: AkairoClient;
        public command: Command;
        public default: DefaultValueSupplier | any;
        public description: string | any;
        public readonly handler: CommandHandler;
        public id: string;
        public index?: number;
        public limit: number;
        public match: ArgumentMatch;
        public flag?: string | string[];
        public prompt?: ArgumentPromptOptions;
        public type: ArgumentType | ArgumentTypeCaster;
        public unordered: boolean | number | number[];

        public allow(message: Message, args: any): boolean;
        public cast(phrase: string, message: Message, args?: any): Promise<any>;
        public collect(message: Message, args?: any, commandInput?: string): Promise<ParsingFlag | any>;
        public process(phrase: string, message: Message, args?: any): Promise<any>;

        public static cast(type: ArgumentType | ArgumentTypeCaster, resolver: TypeResolver, phrase: string, message: Message, args?: any): Promise<any>;
        public static compose(type1: ArgumentType | ArgumentTypeCaster, type2: ArgumentType | ArgumentTypeCaster): ArgumentTypeCaster;
        public static range(type: ArgumentType | ArgumentTypeCaster, min: number, max: number, inclusive?: boolean): ArgumentTypeCaster;
        public static tuple(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster;
        public static union(...types: (ArgumentType | ArgumentTypeCaster)[]): ArgumentTypeCaster;
        public static validate(type: ArgumentType | ArgumentTypeCaster, predicate: ParsedValuePredicate): ArgumentTypeCaster;
    }

    export class ArgumentParser {
        public constructor(command: Command, parser: ContentParser, args: (ArgumentOptions | Control)[]);

        public command: Command;
        public parser: ContentParser;
        public args: (ArgumentOptions | Control)[];

        public buildArgs(args: (ArgumentOptions | Control)[]): (Argument | Control)[];
        public parse(message: Message, content: string): Promise<object|ParsingFlag>;

        public static getFlags(args: (ArgumentOptions | Control)[]): object;
    }

    export class Category<K, V> extends Collection<K, V> {
        public constructor(id: string, iterable?: Iterable<[K, V][]>);

        public id: string;

        public reloadAll(): this;
        public removeAll(): this;
    }

    export class ClientUtil {
        public constructor(client: AkairoClient);

        public readonly client: AkairoClient;

        public attachment(file: BufferResolvable | Stream, name?: string): MessageAttachment;
        public checkChannel(text: string, channel: Channel, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkEmoji(text: string, emoji: Emoji, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkGuild(text: string, guild: Guild, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkMember(text: string, member: GuildMember, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkRole(text: string, role: Role, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public checkUser(text: string, user: User, caseSensitive?: boolean, wholeWord?: boolean): boolean;
        public collection<K, V>(iterable: Iterable<[K, V][]>): Collection<K, V>;
        public compareStreaming(oldMember: GuildMember, newMember: GuildMember): number;
        public embed(data?: object): MessageEmbed;
        public fetchMember(guild: Guild, id: string, cache?: boolean): Promise<GuildMember>;
        public resolveChannel(text: string, channels: Collection<Snowflake, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Channel;
        public resolveChannels(text: string, channels: Collection<Snowflake, Channel>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Channel>;
        public resolveEmoji(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Emoji;
        public resolveEmojis(text: string, emojis: Collection<Snowflake, Emoji>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Emoji>;
        public resolveGuild(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Guild;
        public resolveGuilds(text: string, guilds: Collection<Snowflake, Guild>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Guild>;
        public resolveMember(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): GuildMember;
        public resolveMembers(text: string, members: Collection<Snowflake, GuildMember>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, GuildMember>;
        public resolvePermissionNumber(number: number): string[];
        public resolveRole(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Role;
        public resolveRoles(text: string, roles: Collection<Snowflake, Role>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, Role>;
        public resolveUser(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): User;
        public resolveUsers(text: string, users: Collection<Snowflake, User>, caseSensitive?: boolean, wholeWord?: boolean): Collection<Snowflake, User>;
    }

    export class Command extends AkairoModule {
        public constructor(id: string, options?: CommandOptions);

        public aliases: string[];
        public args: ArgumentParser | ArgumentProvider;
        public quoted: boolean;
        public category: Category<string, Command>;
        public channel?: string;
        public client: AkairoClient;
        public clientPermissions: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
        public cooldown?: number;
        public defaultPrompt: ArgumentPromptOptions;
        public description: string | any;
        public editable: boolean;
        public filepath: string;
        public handler: CommandHandler;
        public id: string;
        public lock?: KeyGenerator;
        public locker?: Set<string>;
        public ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public ownerOnly: boolean;
        public parser?: ContentParser;
        public prefix?: string | string[] | PrefixSupplier;
        public ratelimit: number;
        public regex: RegExp | RegexSupplier;
        public typing: boolean;
        public userPermissions: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;

        public before(message: Message): any;
        public condition(message: Message): boolean;
        public exec(message: Message, args: any): any;
        public parse(message: Message, content: string): Promise<object|ParsingFlag>;
        public reload(): this;
        public remove(): this;
    }

    export class CommandHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: CommandHandlerOptions);

        public aliasReplacement?: RegExp;
        public aliases: Collection<string, string>;
        public allowMention: boolean | MentionPrefixPredicate;
        public blockBots: boolean;
        public blockClient: boolean;
        public categories: Collection<string, Category<string, Command>>;
        public classToHandle: typeof Command;
        public client: AkairoClient;
        public commandUtil: boolean;
        public commandUtilLifetime: number;
        public commandUtils: Collection<string, CommandUtil>;
        public commandUtilSweepInterval: number;
        public cooldowns: Collection<string, object>;
        public defaultCooldown: number;
        public defaultPrompt: ArgumentPromptOptions;
        public directory: string;
        public fetchMembers: boolean;
        public handleEdits: boolean;
        public ignoreCooldown: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public ignorePermissions: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        public inhibitorHandler?: InhibitorHandler;
        public modules: Collection<string, Command>;
        public prefix: string | string[] | PrefixSupplier;
        public prefixes: Collection<string | PrefixSupplier, Set<string>>;
        public prompts: Collection<string, Set<string>>;
        public resolver: TypeResolver;
        public storeMessage: boolean;

        public add(filename: string): Command;
        public addPrompt(channel: Channel, user: User): void;
        public deregister(command: Command): void;
        public emitError(err: Error, message: Message, command: Command): void;
        public findCategory(name: string): Category<string, Command>;
        public findCommand(name: string): Command;
        public handle(message: Message): Promise<boolean | null>;
        public handleDirectCommand(message: Message, content: string, command: Command, ignore?: boolean): Promise<boolean | null>;
        public handleRegexAndConditionalCommands(message: Message): Promise<boolean>;
        public handleRegexCommands(message: Message): Promise<boolean>;
        public handleConditionalCommands(message: Message): Promise<boolean>;
        public hasPrompt(channel: Channel, user: User): boolean;
        public load(thing: string | Function): Command;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public parseCommand(message: Message): Promise<object | null>;
        public parseCommandWithOverwrittenPrefixes(message: Message): Promise<object | null>;
        public register(command: Command, filepath?: string): void;
        public reload(id: string): Command;
        public reloadAll(): this;
        public remove(id: string): Command;
        public removeAll(): this;
        public removePrompt(channel: Channel, user: User): void;
        public runAllTypeInhibitors(message: Message): Promise<boolean>;
        public runPermissionChecks(message: Message, command: Command): Promise<boolean>;
        public runPreTypeInhibitors(message: Message): Promise<boolean>;
        public runPostTypeInhibitors(message: Message, command: Command): Promise<boolean>;
        public runCooldowns(message: Message, command: Command): boolean;
        public runCommand(message: Message, command: Command, args: any): Promise<void>;
        public useInhibitorHandler(inhibitorHandler: InhibitorHandler): void;
        public useListenerHandler(ListenerHandler: ListenerHandler): void;
        public on(event: 'remove', listener: (command: Command) => any): this;
        public on(event: 'load', listener: (command: Command, isReload: boolean) => any): this;
        public on(event: 'commandBlocked', listener: (message: Message, command: Command, reason: string) => any): this;
        public on(event: 'commandCancelled', listener: (message: Message, command: Command, retryMessage?: Message) => any): this;
        public on(event: 'commandFinished', listener: (message: Message, command: Command, args: any, returnValue: any) => any): this;
        public on(event: 'commandStarted', listener: (message: Message, command: Command, args: any) => any): this;
        public on(event: 'cooldown', listener: (message: Message, command: Command, remaining: number) => any): this;
        public on(event: 'error', listener: (error: Error, message: Message, command: Command) => any): this;
        public on(event: 'inPrompt' | 'messageInvalid', listener: (message: Message) => any): this;
        public on(event: 'messageBlocked', listener: (message: Message, reason: string) => any): this;
        public on(event: 'missingPermissions', listener: (message: Message, command: Command, type: 'client' | 'user', missing?: any) => any): this;
    }

    export class CommandUtil {
        public constructor(handler: CommandHandler, message: Message);

        public handler: CommandHandler;
        public lastResponse?: Message;
        public message: Message;
        public messages?: Collection<Snowflake, Message>;
        public parsed?: ParsedComponentData;
        public shouldEdit: boolean;

        public addMessage(message: Message | Message[]): Message | Message[];
        public edit(content?: StringResolvable, options?: MessageEmbed | MessageEditOptions): Promise<Message>;
        public reply(content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<Message | Message[]>;
        public send(content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<Message | Message[]>;
        public sendNew(content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<Message | Message[]>;
        public setEditable(state: boolean): this;
        public setLastResponse(message: Message | Message[]): Message;

        public static transformOptions(content?: StringResolvable, options?: MessageOptions | MessageAdditions): any[];
    }

    export class ContentParser {
        public constructor(options?: ContentParserOptions);

        public flagWords: string[];
        public optionFlagWords: string[];
        public quoted: boolean;
        public separator?: string;

        public parse(content: string): object;

        public static ContentParserState: typeof ContentParserState;
    }

    class ContentParserState {
        public constructor(parser: ContentParser, content: string);

        public content: string;
        public parser: ContentParser;
        public position: number;
        public token: object;
        public tokens: object[];

        public check(...types: string[]): boolean;
        public createToken(type: string, value: string): object;
        public match(...types: string[]): object;
        public next(): void;
        public parse(): object;
        public parseArgument(): object;
        public parseFlag(): object;
        public parsePhrase(): object;
        public tokenize(): object[];
    }

    export class Control {
        public control(data: object): any;
        public getArgs(): (ArgumentOptions | Control)[];

        public static Control: typeof Control;
        public static IfControl: typeof IfControl;
        public static CaseControl: typeof CaseControl;
        public static DoControl: typeof DoControl;
        public static EndControl: typeof EndControl;
        public static CancelControl: typeof CancelControl;

        public static if(condition: ControlPredicate, trueArguments?: (ArgumentOptions | Control)[], falseArguments?: (ArgumentOptions | Control)[]): IfControl;
        public static case(...condArgs: (ControlPredicate | (ArgumentOptions | Control)[])[]): CaseControl;
        public static do(fn: ControlAction): DoControl;
        public static end(): EndControl;
        public static cancel(): CancelControl;
    }

    class IfControl extends Control {
        public constructor(condition: ControlPredicate, trueArguments?: (ArgumentOptions | Control)[], falseArguments?: (ArgumentOptions | Control)[]);

        public condition: ControlPredicate;
        public trueArguments: (ArgumentOptions | Control)[];
        public falseArguments: (ArgumentOptions | Control)[];
    }

    class CaseControl extends Control {
        public constructor(condArgs: (ControlPredicate | (ArgumentOptions | Control)[])[]);

        public condArgs: (ControlPredicate | (ArgumentOptions | Control)[])[];
    }

    class DoControl extends Control {
        public constructor(fn: ControlAction);

        public fn: ControlAction;
    }

    class EndControl extends Control {}

    class CancelControl extends Control {}

    export class Inhibitor extends AkairoModule {
        public constructor(id: string, options?: InhibitorOptions);

        public category: Category<string, Inhibitor>;
        public client: AkairoClient;
        public filepath: string;
        public handler: InhibitorHandler;
        public id: string;
        public reason: string;
        public type: string;

        public exec(message: Message, command?: Command): boolean | Promise<boolean>;
        public reload(): this;
        public remove(): this;
    }

    export class InhibitorHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Inhibitor>>;
        public classToHandle: typeof Inhibitor;
        public client: AkairoClient;
        public directory: string;
        public modules: Collection<string, Inhibitor>;

        public deregister(inhibitor: Inhibitor): void;
        public findCategory(name: string): Category<string, Inhibitor>;
        public load(thing: string | Function): Inhibitor;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(inhibitor: Inhibitor, filepath?: string): void;
        public reload(id: string): Inhibitor;
        public reloadAll(): this;
        public remove(id: string): Inhibitor;
        public removeAll(): this;
        public test(type: 'all' | 'pre' | 'post', message: Message, command?: Command): Promise<string | void>;
        public on(event: 'remove', listener: (inhibitor: Inhibitor) => any): this;
        public on(event: 'load', listener: (inhibitor: Inhibitor, isReload: boolean) => any): this;
    }

    export class Listener extends AkairoModule {
        public constructor(id: string, options?: ListenerOptions);

        public category: Category<string, Listener>;
        public client: AkairoClient;
        public emitter: string | EventEmitter;
        public event: string;
        public filepath: string;
        public handler: ListenerHandler;
        public type: string;

        public exec(...args: any[]): any;
        public reload(): this;
        public remove(): this;
    }

    export class ListenerHandler extends AkairoHandler {
        public constructor(client: AkairoClient, options: AkairoHandlerOptions);

        public categories: Collection<string, Category<string, Listener>>;
        public classToHandle: typeof Listener;
        public client: AkairoClient;
        public directory: string;
        public emitters: Collection<string, EventEmitter>;
        public modules: Collection<string, Listener>;

        public add(filename: string): Listener;
        public addToEmitter(id: string): Listener;
        public deregister(listener: Listener): void;
        public findCategory(name: string): Category<string, Listener>;
        public load(thing: string | Function): Listener;
        public loadAll(directory?: string, filter?: LoadPredicate): this;
        public register(listener: Listener, filepath?: string): void;
        public reload(id: string): Listener;
        public reloadAll(): this;
        public remove(id: string): Listener;
        public removeAll(): this;
        public removeFromEmitter(id: string): Listener;
        public setEmitters(emitters: { [x: string]: EventEmitter }): void;
        public on(event: 'remove', listener: (listener: Listener) => any): this;
        public on(event: 'load', listener: (listener: Listener, isReload: boolean) => any): this;
    }

    export class ParsingFlag {
        public static CommandCancel: typeof CommandCancel;
        public static CommandRetry: typeof CommandRetry;

        public static cancel(): CommandCancel;
        public static retry(message: Message): CommandRetry;
    }

    class CommandCancel extends ParsingFlag {}

    class CommandRetry extends ParsingFlag {
        public constructor(message: Message);

        public message: Message;
    }

    export abstract class Provider {
        public items: Collection<string, any>;

        public abstract clear(id: string): any;
        public abstract delete(id: string, key: string): any;
        public abstract get(id: string, key: string, defaultValue: any): any;
        public abstract init(): any;
        public abstract set(id: string, key: string, value: any): any;
    }

    export class SequelizeProvider extends Provider {
        public constructor(table: Model<any, any>, options?: ProviderOptions);

        public dataColumn?: string;
        public idColumn: string;
        public items: Collection<string, any>;
        public table: Model<any, any>;

        public clear(id: string): Promise<void>;
        public delete(id: string, key: string): Promise<boolean>;
        public get(id: string, key: string, defaultValue: any): any;
        public init(): Promise<void>;
        public set(id: string, key: string, value: any): Promise<boolean>;
    }

    export class SQLiteProvider extends Provider {
        public constructor(db: Database | Promise<Database>, tableName: string, options?: ProviderOptions);

        public dataColumn?: string;
        public db: Database;
        public idColumn: string;
        public items: Collection<string, any>;
        public tableName: string;

        public clear(id: string): Promise<Statement>;
        public delete(id: string, key: string): Promise<Statement>;
        public get(id: string, key: string, defaultValue: any): any;
        public init(): Promise<void>;
        public set(id: string, key: string, value: any): Promise<Statement>;
    }

    export class TypeResolver {
        public constructor(handler: CommandHandler);

        public client: AkairoClient;
        public commandHandler: CommandHandler;
        public inhibitorHandler?: InhibitorHandler;
        public listenerHandler?: ListenerHandler;
        public types: Collection<string, ArgumentTypeCaster>;

        public addBuiltInTypes(): void;
        public addType(name: string, fn: ArgumentTypeCaster): this;
        public addTypes(types: { [x: string]: ArgumentTypeCaster }): this;
        public type(name: string): ArgumentTypeCaster;
    }

    export class Util {
        public static isEventEmitter(value: any): boolean;
        public static isPromise(value: any): boolean;
    }

    export type AkairoHandlerOptions = {
        automateCategories?: boolean;
        classToHandle?: string;
        directory?: string;
        extensions?: string[] | Set<string>;
        loadFilter?: LoadPredicate;
    };

    export type AkairoModuleOptions = {
        category?: string;
    };

    export type AkairoOptions = {
        ownerID?: Snowflake | Snowflake[];
    };

    export type ArgumentOptions = {
        default?: DefaultValueSupplier | any;
        description?: StringResolvable;
        id: string;
        index?: number;
        limit?: number;
        match?: ArgumentMatch;
        flag?: string | string[];
        prompt?: ArgumentPromptOptions;
        type?: ArgumentType | ArgumentTypeCaster;
        unordered?: boolean | number | number[];
    };

    export type ArgumentPromptData = {
        infinite: boolean;
        message: Message;
        retries: number;
        phrase: string;
    };

    export type ArgumentPromptOptions = {
        breakout?: boolean;
        cancel?: StringResolvable | MessageOptions | MessageAdditions | PromptContentSupplier;
        cancelWord?: string;
        ended?: StringResolvable | MessageOptions | MessageAdditions | PromptContentSupplier;
        infinite?: boolean;
        limit?: number;
        modifyCancel?: PromptContentModifier;
        modifyEnded?: PromptContentModifier;
        modifyRetry?: PromptContentModifier;
        modifyStart?: PromptContentModifier;
        modifyTimeout?: PromptContentModifier;
        optional?: boolean;
        retries?: number;
        retry?: StringResolvable | MessageOptions | MessageAdditions | PromptContentSupplier;
        start?: StringResolvable | MessageOptions | MessageAdditions | PromptContentSupplier;
        stopWord?: string;
        time?: number;
        timeout?: StringResolvable | MessageOptions | MessageAdditions | PromptContentSupplier;
    };

    export type CommandOptions = {
        aliases?: string[];
        args?: (ArgumentOptions | Control)[] | ArgumentProvider;
        before?: BeforeAction;
        channel?: 'guild' | 'dm';
        clientPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
        condition?: ExecutionPredicate;
        cooldown?: number;
        defaultPrompt?: ArgumentPromptOptions;
        description?: StringResolvable;
        editable?: boolean;
        lock?: KeyGenerator | 'guild' | 'channel' | 'user';
        ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        ownerOnly?: boolean;
        prefix?: string | string[] | PrefixSupplier;
        ratelimit?: number;
        regex?: RegExp | RegexSupplier;
        separator?: string;
        typing?: boolean;
        userPermissions?: PermissionResolvable | PermissionResolvable[] | MissingPermissionSupplier;
        quoted?: boolean;
    } & AkairoModuleOptions;

    export type CommandHandlerOptions = {
        aliasReplacement?: RegExp;
        allowMention?: boolean | MentionPrefixPredicate;
        blockBots?: boolean;
        blockClient?: boolean;
        commandUtil?: boolean;
        commandUtilLifetime?: number;
        commandUtilSweepInterval?: number;
        defaultCooldown?: number;
        defaultPrompt?: ArgumentPromptOptions;
        fetchMembers?: boolean;
        handleEdits?: boolean;
        ignoreCooldown?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        ignorePermissions?: Snowflake | Snowflake[] | IgnoreCheckPredicate;
        prefix?: string | string[] | PrefixSupplier;
        storeMessages?: boolean;
    } & AkairoHandlerOptions;

    export type ContentParserOptions = {
        flagWords?: string[];
        optionFlagWords?: string[];
        quoted?: boolean;
        separator?: string;
    };

    export type InhibitorOptions = {
        reason?: string;
        type?: string;
    } & AkairoModuleOptions;

    export type ListenerOptions = {
        emitter: string | EventEmitter;
        event: string;
        type?: string;
    } & AkairoModuleOptions;

    export type ParsedComponentData = {
        afterContent?: string;
        alias?: string;
        command?: Command;
        content?: string;
        prefix?: string;
    };

    export type ProviderOptions = {
        dataColumn?: string;
        idColumn?: string;
    };

    export type ArgumentMatch = 'phrase' | 'rest' | 'separate' | 'flag' | 'option' | 'text' | 'content' | 'none';

    export type ArgumentType = 'string' | 'lowercase' | 'uppercase' | 'charCodes'
        | 'number' | 'integer' | 'bigint' | 'emojint'
        | 'url' | 'date' | 'color'
        | 'user' | 'users' | 'member' | 'members' | 'relevant' | 'relevants'
        | 'channel' | 'channels' | 'textChannel' | 'textChannels' | 'voiceChannel' | 'voiceChannels'
        | 'role' | 'roles' | 'emoji' | 'emojis' | 'guild' | 'guilds'
        | 'message' | 'guildMessage' | 'invite'
        | 'memberMention' | 'channelMention' | 'roleMention' | 'emojiMention'
        | 'commandAlias' | 'command' | 'inhibitor' | 'listener'
        | (string | string[])[]
        | RegExp;

    export type ArgumentProvider = (message: Message, content: string) => any;

    export type ArgumentTypeCaster = (phrase: string, message: Message, prevArgs: any) => any;

    export type BeforeAction = (message: Message) => any;

    export type ControlAction = (message: Message, args: any) => any;

    export type ControlPredicate = (message: Message, args: any) => boolean;

    export type DefaultValueSupplier = (message: Message, args: any) => any;

    export type ExecutionPredicate = (message: Message) => boolean;

    export type IgnoreCheckPredicate = (message: Message, command: Command) => boolean;

    export type KeyGenerator = (message: Message, args: any) => string;

    export type LoadPredicate = (filepath: string) => boolean;

    export type MentionPrefixPredicate = (message: Message) => boolean;

    export type MissingPermissionSupplier = (message: Message) => Promise<any> | any;

    export type ParsedValuePredicate = (value: any, phrase: string, message: Message, args: any) => boolean;

    export type PrefixSupplier = (message: Message) => string | string[] | Promise<string | string[]>;

    export type PromptContentModifier = (text: string, message: Message, args: any, data: ArgumentPromptData) => StringResolvable | MessageOptions | MessageAdditions;

    export type PromptContentSupplier = (message: Message, args: any, data: ArgumentPromptData) => StringResolvable | MessageOptions | MessageAdditions;

    export type RegexSupplier = (message: Message) => RegExp;

    export const Constants: {
        ArgumentMatches: {
            PHRASE: 'phrase',
            FLAG: 'flag',
            OPTION: 'option',
            TEXT: 'text',
            CONTENT: 'content',
            REST: 'rest',
            SEPARATE: 'separate',
            NONE: 'none'
        },
        ArgumentTypes: {
            STRING: 'string',
            LOWERCASE: 'lowercase',
            UPPERCASE: 'uppercase',
            CHAR_CODES: 'charCodes',
            NUMBER: 'number',
            INTEGER: 'integer',
            BIGINT: 'bigint',
            EMOJINT: 'emojint',
            URL: 'url',
            DATE: 'date',
            COLOR: 'color',
            USER: 'user',
            USERS: 'users',
            MEMBER: 'member',
            MEMBERS: 'members',
            RELEVANT: 'relevant',
            RELEVANTS: 'relevants',
            CHANNEL: 'channel',
            CHANNELS: 'channels',
            TEXT_CHANNEL: 'textChannel',
            TEXT_CHANNELS: 'textChannels',
            VOICE_CHANNEL: 'voiceChannel',
            VOICE_CHANNELS: 'voiceChannels',
            ROLE: 'role',
            ROLES: 'roles',
            EMOJI: 'emoji',
            EMOJIS: 'emojis',
            GUILD: 'guild',
            GUILDS: 'guilds',
            MESSAGE: 'message',
            GUILD_MESSAGE: 'guildMessage',
            INVITE: 'invite',
            MEMBER_MENTION: 'memberMention',
            CHANNEL_MENTION: 'channelMention',
            ROLE_MENTION: 'roleMention',
            EMOJI_MENTION: 'emojiMention',
            COMMAND_ALIAS: 'commandAlias',
            COMMAND: 'command',
            INHIBITOR: 'inhibitor',
            LISTENER: 'listener'
        },
        AkairoHandlerEvents: {
            LOAD: 'load',
            REMOVE: 'remove'
        },
        CommandHandlerEvents: {
            MESSAGE_BLOCKED: 'messageBlocked',
            MESSAGE_INVALID: 'messageInvalid',
            COMMAND_BLOCKED: 'commandBlocked',
            COMMAND_STARTED: 'commandStarted',
            COMMAND_FINISHED: 'commandFinished',
            COMMAND_CANCELLED: 'commandCancelled',
            COMMAND_LOCKED: 'commandLocked',
            MISSING_PERMISSIONS: 'missingPermissions',
            COOLDOWN: 'cooldown',
            IN_PROMPT: 'inPrompt',
            ERROR: 'error'
        },
        BuiltInReasons: {
            CLIENT: 'client',
            BOT: 'bot',
            OWNER: 'owner',
            GUILD: 'guild',
            DM: 'dm'
        }
    };

    export const version: string;
}

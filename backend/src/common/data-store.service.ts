import { Injectable } from '@nestjs/common';

interface Collection<T> {
  [id: string]: T;
}

interface Entity {
  id: string;
  [key: string]: any;
}

@Injectable()
export class DataStoreService {
  protected users: Collection<any> = {};
  protected customers: Collection<any> = {};
  protected campaigns: Collection<any> = {};
  protected campaignMessages: Collection<any> = {};
  protected conversations: Collection<any> = {};
  protected messages: Collection<any> = {};
  protected templates: Collection<any> = {};
  protected settings: Collection<any> = {};
  protected knowledgeBase: Collection<any> = {};
  protected logs: Collection<any> = {};

  private uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private now(): string {
    return new Date().toISOString();
  }

  private clone(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    return JSON.parse(JSON.stringify(obj));
  }

  private queryCollection(collection: Record<string, any>, where?: any): any[] {
    let results = Object.values(collection);

    if (!where) return results;

    for (const key of Object.keys(where)) {
      if (key === 'OR' && Array.isArray(where[key])) {
        results = results.filter((item) =>
          where[key].some((condition: any) => {
            const subKey = Object.keys(condition)[0];
            const subVal = Object.values(condition)[0];
            return this.matches(item, subKey, subVal);
          }),
        );
      } else if (key === 'AND' && Array.isArray(where[key])) {
        results = results.filter((item) =>
          where[key].every((condition: any) => {
            const subKey = Object.keys(condition)[0];
            const subVal = Object.values(condition)[0];
            return this.matches(item, subKey, subVal);
          }),
        );
      } else if (key !== 'NOT') {
        results = results.filter((item) => this.matches(item, key, where[key]));
      }
    }

    return results;
  }

  private matches(item: any, key: string, value: any): boolean {
    if (typeof value === 'object' && value !== null) {
      if ('contains' in value && 'mode' in value) {
        const itemVal = this.getNested(item, key);
        return String(itemVal || '')
          .toLowerCase()
          .includes(String(value.contains).toLowerCase());
      }
      if ('contains' in value) {
        const itemVal = this.getNested(item, key);
        return String(itemVal || '').includes(String(value.contains));
      }
      if ('startsWith' in value) {
        const itemVal = this.getNested(item, key);
        return String(itemVal || '').startsWith(String(value.startsWith));
      }
      if ('endsWith' in value) {
        const itemVal = this.getNested(item, key);
        return String(itemVal || '').endsWith(String(value.endsWith));
      }
      if ('gte' in value) {
        const itemVal = this.getNested(item, key);
        return new Date(itemVal) >= new Date(value.gte);
      }
      if ('lte' in value) {
        const itemVal = this.getNested(item, key);
        return new Date(itemVal) <= new Date(value.lte);
      }
      if ('in' in value && Array.isArray(value.in)) {
        return value.in.includes(this.getNested(item, key));
      }
      if ('not' in value) {
        return this.getNested(item, key) !== value.not;
      }
      if ('equals' in value) {
        return this.getNested(item, key) === value.equals;
      }
    }
    return this.getNested(item, key) === value;
  }

  private getNested(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private sortResults(results: any[], orderBy: any): any[] {
    if (!orderBy) return results;

    const entries = Array.isArray(orderBy) ? orderBy : [orderBy];

    return [...results].sort((a, b) => {
      for (const entry of entries) {
        const key = Object.keys(entry)[0];
        const dir = entry[key];
        const aVal = this.getNested(a, key);
        const bVal = this.getNested(b, key);

        if (aVal == null && bVal == null) continue;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal);
          if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
        } else {
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
        }
      }
      return 0;
    });
  }

  private applyPagination(results: any[], skip?: number, take?: number): any[] {
    let items = results;
    if (skip) items = items.slice(skip);
    if (take) items = items.slice(0, take);
    return items;
  }

  private resolveIncludes(
    items: any[],
    include?: any,
  ): any[] {
    if (!include) return items;

    return items.map((item) => {
      const result = { ...item };

      for (const [relation, config] of Object.entries(include)) {
        if (typeof config === 'object' && config !== null) {
          const relatedItems = this.resolveRelation(item, relation, config as any);
          result[relation] = relatedItems;
        } else if (config === true) {
          const relatedItems = this.resolveRelation(item, relation, {});
          result[relation] = relatedItems;
        }
      }

      return result;
    });
  }

  private resolveRelation(
    item: any,
    relation: string,
    config: any,
  ): any {
    const pluralMap: Record<string, string> = {
      messages: 'messages',
      conversations: 'conversations',
      customer: 'customers',
      user: 'users',
      template: 'templates',
      campaign: 'campaigns',
      _count: '_count',
    };

    const collName = pluralMap[relation] || relation;
    const collection = (this as any)[collName] as Record<string, any>;

    if (!collection) return null;

    let results: any[] = [];

    if (relation === 'customer') {
      results = Object.values(collection).filter(
        (c: any) => c.id === item.customerId,
      );
    } else if (relation === 'user') {
      results = Object.values(collection).filter(
        (u: any) => u.id === item.userId || u.id === item.assignedTo,
      );
    } else if (relation === 'template') {
      results = Object.values(collection).filter(
        (t: any) => t.id === item.templateId,
      );
    } else if (relation === 'messages') {
      results = Object.values(collection).filter(
        (m: any) => m.conversationId === item.id || m.campaignId === item.id,
      );
    } else if (relation === 'conversations') {
      results = Object.values(collection).filter(
        (c: any) => c.customerId === item.id,
      );
    } else if (relation === '_count') {
      const count: any = {};
      if (config.select?.messages) {
        count.messages = Object.values(this.messages).filter(
          (m: any) => m.conversationId === item.id || m.campaignId === item.id,
        ).length;
      }
      return count;
    }

    if (config.take) {
      results = results.slice(0, config.take);
    }
    if (config.orderBy) {
      results = this.sortResults(results, config.orderBy);
    }
    if (config.select) {
      results = results.map((r) => {
        const selected: any = {};
        for (const key of Object.keys(config.select)) {
          selected[key] = r[key];
        }
        return selected;
      });
    }

    if (results.length <= 1 && (relation === 'customer' || relation === 'user' || relation === 'template')) {
      return results[0] || null;
    }

    return results;
  }

  private applySelect(item: any, select?: any): any {
    if (!select) return item;
    const result: any = {};
    for (const key of Object.keys(select)) {
      if (select[key] === true) {
        result[key] = item[key];
      } else if (typeof select[key] === 'object') {
        result[key] = this.applySelect(item[key], select[key]);
      }
    }
    return result;
  }

  private getCollection(name: string): Record<string, any> {
    const map: Record<string, string> = {
      user: 'users',
      users: 'users',
      customer: 'customers',
      customers: 'customers',
      campaign: 'campaigns',
      campaigns: 'campaigns',
      campaignMessage: 'campaignMessages',
      campaignMessages: 'campaignMessages',
      conversation: 'conversations',
      conversations: 'conversations',
      message: 'messages',
      messages: 'messages',
      template: 'templates',
      templates: 'templates',
      setting: 'settings',
      settings: 'settings',
      knowledgeBase: 'knowledgeBase',
      log: 'logs',
      logs: 'logs',
    };

    const key = map[name];
    if (!key) throw new Error(`Unknown collection: ${name}`);
    return (this as any)[key] as Record<string, any>;
  }

  findUnique(model: string, args: { where: any; select?: any; include?: any }) {
    const collection = this.getCollection(model);
    const items = this.queryCollection(collection, args.where);
    const item = items[0] || null;
    if (!item) return null;

    const resolved = this.resolveIncludes(
      item ? [item] : [],
      args.include,
    )[0] || null;

    if (args.select && resolved) {
      return this.applySelect(resolved, args.select);
    }

    return resolved || null;
  }

  findFirst(model: string, args: { where?: any; orderBy?: any; include?: any; select?: any }) {
    const collection = this.getCollection(model);
    let results = this.queryCollection(collection, args.where || {});
    results = this.sortResults(results, args.orderBy);
    const item = results[0] || null;
    if (!item) return null;

    const resolved = this.resolveIncludes(item ? [item] : [], args.include)[0] || null;

    if (args.select && resolved) {
      return this.applySelect(resolved, args.select);
    }

    return resolved || null;
  }

  findMany(model: string, args: { where?: any; orderBy?: any; skip?: number; take?: number; include?: any; select?: any }) {
    const collection = this.getCollection(model);
    let results = this.queryCollection(collection, args.where || {});
    results = this.sortResults(results, args.orderBy);
    results = this.applyPagination(results, args.skip, args.take);
    results = this.resolveIncludes(results, args.include);

    if (args.select) {
      results = results.map((r) => this.applySelect(r, args.select));
    }

    return results;
  }

  create(model: string, args: { data: any; select?: any; include?: any }) {
    const collection = this.getCollection(model);
    const id = this.uuid();
    const now = this.now();

    const timestamps: any = {};
    if (model !== 'log') {
      timestamps.createdAt = now;
      timestamps.updatedAt = now;
    }

    const item = {
      id,
      ...args.data,
      ...timestamps,
    };

    collection[id] = this.clone(item);

    const resolved = this.resolveIncludes([item], args.include)[0] || item;
    return args.select ? this.applySelect(resolved, args.select) : resolved;
  }

  createMany(model: string, args: { data: any[] }) {
    const results: any[] = [];
    for (const data of args.data) {
      results.push(this.create(model, { data }));
    }
    return results;
  }

  update(model: string, args: { where: any; data: any; select?: any; include?: any }) {
    const collection = this.getCollection(model);
    const items = this.queryCollection(collection, args.where);
    const existing = items[0];

    if (!existing) return null;

    const updated = {
      ...existing,
      ...args.data,
      updatedAt: this.now(),
    };

    collection[existing.id] = this.clone(updated);

    const resolved = this.resolveIncludes([updated], args.include)[0] || updated;
    return args.select ? this.applySelect(resolved, args.select) : resolved;
  }

  updateMany(model: string, args: { where: any; data: any }) {
    const collection = this.getCollection(model);
    const items = this.queryCollection(collection, args.where);

    for (const item of items) {
      collection[item.id] = {
        ...item,
        ...args.data,
        updatedAt: this.now(),
      };
    }

    return { count: items.length };
  }

  delete(model: string, args: { where: any }) {
    const collection = this.getCollection(model);
    const items = this.queryCollection(collection, args.where);
    const existing = items[0];

    if (!existing) return null;

    delete collection[existing.id];
    return existing;
  }

  count(model: string, args?: { where?: any }) {
    const collection = this.getCollection(model);
    const results = args?.where
      ? this.queryCollection(collection, args.where)
      : Object.values(collection);
    return results.length;
  }

  upsert(model: string, args: { where: any; create: any; update: any; select?: any }) {
    const collection = this.getCollection(model);
    const items = this.queryCollection(collection, args.where);
    const existing = items[0];

    if (existing) {
      return this.update(model, { where: args.where, data: args.update, select: args.select });
    }

    return this.create(model, { data: args.create, select: args.select });
  }

  findUniqueOrThrow(model: string, args: { where: any; select?: any; include?: any }) {
    const result = this.findUnique(model, args);
    if (!result) throw new Error(`${model} not found`);
    return result;
  }
}

// ==========================================================================
// Project:  Ember Data
// Copyright: ©2011 Living Social Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================



(function(){window.DS=Ember.Namespace.create({CURRENT_API_REVISION:4})})(),function(){var a=Ember.get,b=Ember.set;DS.RecordArray=Ember.ArrayProxy.extend({type:null,content:null,store:null,init:function(){b(this,"recordCache",Ember.A([])),this._super()},arrayDidChange:function(b,c,d,e){var f=a(this,"recordCache");f.replace(c,0,new Array(e)),this._super(b,c,d,e)},arrayWillChange:function(b,c,d,e){this._super(b,c,d,e);var f=a(this,"recordCache");f.replace(c,d)},objectAtContent:function(b){var c=a(this,"recordCache"),d=c.objectAt(b);if(!d){var e=a(this,"store"),f=a(this,"content"),g=f.objectAt(b);g!==undefined&&(d=e.findByClientId(a(this,"type"),g),c.replace(b,1,[d]))}return d}})}(),function(){var a=Ember.get;DS.FilteredRecordArray=DS.RecordArray.extend({filterFunction:null,replace:function(){var b=a(this,"type").toString();throw new Error("The result of a client-side filter (on "+b+") is immutable.")},updateFilter:Ember.observer(function(){var b=a(this,"store");b.updateRecordArrayFilter(this,a(this,"type"),a(this,"filterFunction"))},"filterFunction")})}(),function(){var a=Ember.get,b=Ember.set;DS.AdapterPopulatedRecordArray=DS.RecordArray.extend({query:null,isLoaded:!1,replace:function(){var b=a(this,"type").toString();throw new Error("The result of a server query (on "+b+") is immutable.")},load:function(c){var d=a(this,"store"),e=a(this,"type"),f=d.loadMany(e,c).clientIds;this.beginPropertyChanges(),b(this,"content",Ember.A(f)),b(this,"isLoaded",!0),this.endPropertyChanges()}})}(),function(){var a=Ember.get,b=Ember.set,c=Ember.guidFor,d=function(){this.hash={},this.list=[]};d.prototype={add:function(a){var b=this.hash,d=c(a);if(b.hasOwnProperty(d))return;b[d]=!0,this.list.push(a)},remove:function(a){var b=this.hash,d=c(a);if(!b.hasOwnProperty(d))return;delete b[d];var e=this.list,f=Ember.ArrayUtils.indexOf(this,a);e.splice(f,1)},isEmpty:function(){return this.list.length===0}};var e=Ember.State.extend({recordWasAdded:function(b,c){var d=b.dirty,e;d.add(c),e=function(){a(c,"isDirty")||(c.removeObserver("isDirty",e),b.send("childWasSaved",c))},c.addObserver("isDirty",e)},recordWasRemoved:function(b,c){var d=b.dirty,e;d.add(c),e=function(){c.removeObserver("isDirty",e),a(c,"isDirty")||b.send("childWasSaved",c)},c.addObserver("isDirty",e)}}),f={clean:e.create({isDirty:!1,recordWasAdded:function(a,b){this._super(a,b),a.goToState("dirty")},update:function(a,c){var d=a.manyArray;b(d,"content",c)}}),dirty:e.create({isDirty:!0,childWasSaved:function(a,b){var c=a.dirty;c.remove(b),c.isEmpty()&&a.send("arrayBecameSaved")},arrayBecameSaved:function(a){a.goToState("clean")}})};DS.ManyArrayStateManager=Ember.StateManager.extend({manyArray:null,initialState:"clean",states:f,init:function(){this._super(),this.dirty=new d}})}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath;DS.ManyArray=DS.RecordArray.extend({init:function(){return b(this,"stateManager",DS.ManyArrayStateManager.create({manyArray:this})),this._super()},parentRecord:null,isDirty:Ember.computed(function(){return c(this,"stateManager.currentState.isDirty")}).property("stateManager.currentState").cacheable(),fetch:function(){var b=a(this,"content"),c=a(this,"store"),d=a(this,"type"),e=b.map(function(a){return c.clientIdToId[a]});c.fetchMany(d,e)},replace:function(b,c,d){var e=a(this,"parentRecord"),f=e&&!a(e,"id"),g=a(this,"stateManager");d=d.map(function(a){return f&&a.send("waitingOn",e),this.assignInverse(a,e),g.send("recordWasAdded",a),a.get("clientId")},this);var h=this.store,i=b+c,j;for(var k=b;k<i;k++)j=this.objectAt(k),this.assignInverse(j,e,!0),g.send("recordWasAdded",j);this._super(b,c,d)},assignInverse:function(c,d,e){var f=a(c.constructor,"associations"),g=f.get(d.constructor),h,i;if(!g)return;for(var j=0,k=g.length;j<k;j++){h=g[j];if(h.kind==="belongsTo"){i=h;break}}i&&b(c,i.name,e?null:d)}})}(),function(){}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath,d=Ember.String.fmt;DS.Transaction=Ember.Object.extend({init:function(){b(this,"buckets",{clean:Ember.Map.create(),created:Ember.Map.create(),updated:Ember.Map.create(),deleted:Ember.Map.create()})},createRecord:function(b,c){var d=a(this,"store");return d.createRecord(b,c,this)},add:function(b){var d=a(b,"transaction"),e=c(this,"store.defaultTransaction");this.adoptRecord(b)},commit:function(){var b=this,c;c=function(c,d,e){var f=b.bucketForType(c);f.forEach(function(b,c){if(c.isEmpty())return;var f=[];c.forEach(function(b){b.send("willCommit"),a(b,"isPending")===!1&&f.push(b)}),d.call(e,b,f)})};var e={updated:{eachType:function(a,b){c("updated",a,b)}},created:{eachType:function(a,b){c("created",a,b)}},deleted:{eachType:function(a,b){c("deleted",a,b)}}},f=a(this,"store"),g=a(f,"_adapter");this.removeCleanRecords();if(g&&g.commit)g.commit(f,e);else throw d("Adapter is either null or do not implement `commit` method",this)},rollback:function(){var b=a(this,"store"),c;["created","updated","deleted"].forEach(function(a){c=this.bucketForType(a),c.forEach(function(a,b){b.forEach(function(a){a.send("rollback")})})},this),this.removeCleanRecords()},remove:function(a){var b=c(this,"store.defaultTransaction");b.adoptRecord(a)},removeCleanRecords:function(){var a=this.bucketForType("clean"),b=this;a.forEach(function(a,c){c.forEach(function(a){b.remove(a)})})},bucketForType:function(b){var c=a(this,"buckets");return a(c,b)},adoptRecord:function(c){var d=a(c,"transaction");d&&d.removeFromBucket("clean",c),this.addToBucket("clean",c),b(c,"transaction",this)},addToBucket:function(a,b){var c=this.bucketForType(a),d=b.constructor,e=c.get(d);e||(e=Ember.OrderedSet.create(),c.set(d,e)),e.add(b)},removeFromBucket:function(a,b){var c=this.bucketForType(a),d=b.constructor,e=c.get(d);e.remove(b)},recordBecameDirty:function(a,b){this.removeFromBucket("clean",b),this.addToBucket(a,b)},recordBecameClean:function(a,b){this.removeFromBucket(a,b);var d=c(this,"store.defaultTransaction");d.adoptRecord(b)}})}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath,d=Ember.String.fmt,e={get:function(a){return this.savedData[a]}},f="unloaded",g="loading";DS.Store=Ember.Object.extend({init:function(){var c=a(this,"revision");if(c!==DS.CURRENT_API_REVISION&&!Ember.ENV.TESTING)throw new Error("Error: The Ember Data library has had breaking API changes since the last time you updated the library. Please review the list of breaking changes at https://github.com/emberjs/data/blob/master/BREAKING_CHANGES.md, then update your store's `revision` property to "+DS.CURRENT_API_REVISION);return(!a(DS,"defaultStore")||a(this,"isDefaultStore"))&&b(DS,"defaultStore",this),this.typeMaps={},this.recordCache=[],this.clientIdToId={},this.recordArraysByClientId={},b(this,"defaultTransaction",this.transaction()),this._super()},transaction:function(){return DS.Transaction.create({store:this})},dataForRecord:function(b){var c=b.constructor,d=a(b,"clientId"),e=this.typeMapFor(c);return e.cidToHash[d]},adapter:null,_adapter:Ember.computed(function(){var b=a(this,"adapter");return typeof b=="string"?c(this,b,!1)||c(window,b):b}).property("adapter").cacheable(),clientIdCounter:1,createRecord:function(c,d,e){d=d||{};var f=c._create({store:this});e=e||a(this,"defaultTransaction"),e.adoptRecord(f);var g=a(f,"primaryKey"),h=d[g]||null,i;Ember.none(h)&&(i=a(this,"adapter"),i&&i.generateIdForRecord&&(h=i.generateIdForRecord(this,f),d.id=h));var j={},k;k=this.pushHash(j,h,c),f.send("didChangeData");var l=a(this,"recordCache");return b(f,"clientId",k),l[k]=f,f.setProperties(d),this.updateRecordArrays(c,k,a(f,"data")),f},deleteRecord:function(a){a.send("deleteRecord")},find:function(a,b,c){if(b===undefined)return this.findAll(a);if(c!==undefined)return this.findMany(a,b,c);if(Ember.typeOf(b)==="object")return this.findQuery(a,b);if(Ember.isArray(b))return this.findMany(a,b);var d=this.typeMapFor(a).idToCid[b];return this.findByClientId(a,d,b)},findByClientId:function(b,c,e){var f=a(this,"recordCache"),h=this.typeMapFor(b).cidToHash,i;if(c!==undefined)i=f[c],i||(i=this.materializeRecord(b,c),typeof h[c]=="object"&&i.send("didChangeData"));else{c=this.pushHash(g,e,b),i=this.materializeRecord(b,c);var j=a(this,"_adapter");if(j&&j.find)j.find(this,b,e);else throw d("Adapter is either null or does not implement `find` method",this)}return i},fetchMany:function(b,c,e){var h=this.typeMapFor(b),i=h.idToCid,j=h.cidToHash,k=h.cidToHash,l,m=Ember.A([]);c?(l=[],c.forEach(function(a){var c=i[a];c===undefined?(c=this.pushHash(g,a,b),l.push(a)):c&&k[c]===f&&(j[c]=g,l.push(a)),m.push(c)},this)):l=null;if(l&&a(l,"length")>0||e){var n=a(this,"_adapter");if(n&&n.findMany)n.findMany(this,b,l,e);else throw d("Adapter is either null or does not implement `findMany` method",this)}return m},findMany:function(a,b,c){var d=this.fetchMany(a,b,c);return this.createManyArray(a,d)},findQuery:function(b,c){var e=DS.AdapterPopulatedRecordArray.create({type:b,content:Ember.A([]),store:this}),f=a(this,"_adapter");if(f&&f.findQuery)f.findQuery(this,b,c,e);else throw d("Adapter is either null or does not implement `findQuery` method",this);return e},findAll:function(b){var c=this.typeMapFor(b),d=c.findAllCache;if(d)return d;var e=DS.RecordArray.create({type:b,content:Ember.A([]),store:this});this.registerRecordArray(e,b);var f=a(this,"_adapter");return f&&f.findAll&&f.findAll(this,b),c.findAllCache=e,e},filter:function(a,b,c){arguments.length===3?this.findQuery(a,b):arguments.length===2&&(c=b);var d=DS.FilteredRecordArray.create({type:a,content:Ember.A([]),store:this,filterFunction:c});return this.registerRecordArray(d,a,c),d},hashWasUpdated:function(b,c,d){if(a(d,"isDeleted"))return;this.updateRecordArrays(b,c,a(d,"data"))},commit:function(){var c=a(this,"defaultTransaction");b(this,"defaultTransaction",this.transaction()),c.commit()},didUpdateRecords:function(a,b){b?a.forEach(function(a,c){this.didUpdateRecord(a,b[c])},this):a.forEach(function(a){this.didUpdateRecord(a)},this)},didUpdateRecord:function(b,c){if(c){var d=a(b,"clientId"),e=this.typeMapFor(b.constructor).cidToHash;e[d]=c,b.send("didChangeData"),b.hashWasUpdated()}b.send("didCommit")},didDeleteRecords:function(a){a.forEach(function(a){a.send("didCommit")})},didDeleteRecord:function(a){a.send("didCommit")},_didCreateRecord:function(b,c,d,e,f){var g=a(b,"data"),h,i;c?(d.cidToHash[e]=c,b.beginPropertyChanges(),b.send("didChangeData"),g.adapterDidUpdate(c),b.hashWasUpdated(),b.endPropertyChanges(),h=c[f],d.idToCid[h]=e,this.clientIdToId[e]=h):g.commit(),b.send("didCommit")},didCreateRecords:function(b,c,d){var e=b.proto().primaryKey,f=this.typeMapFor(b),g;for(var h=0,i=a(c,"length");h<i;h++){var j=c[h],k=d[h];g=a(j,"clientId"),this._didCreateRecord(j,k,f,g,e)}},didCreateRecord:function(b,c){var d=b.constructor,e=this.typeMapFor(d),f,g;g=d.proto().primaryKey,!c,f=a(b,"clientId"),this._didCreateRecord(b,c,e,f,g)},recordWasInvalid:function(a,b){a.send("becameInvalid",b)},registerRecordArray:function(a,b,c){var d=this.typeMapFor(b).recordArrays;d.push(a),this.updateRecordArrayFilter(a,b,c)},createManyArray:function(a,b){var c=DS.ManyArray.create({type:a,content:b,store:this});return b.forEach(function(a){var b=this.recordArraysForClientId(a);b.add(c)},this),c},updateRecordArrayFilter:function(b,c,d){var f=this.typeMapFor(c),g=f.cidToHash,h=f.clientIds,i,j,k,l=a(this,"recordCache"),m;for(var n=0,o=h.length;n<o;n++)i=h[n],j=g[i],typeof j=="object"&&((m=l[i])?k=a(m,"data"):(e.savedData=j,k=e),this.updateRecordArray(b,d,c,i,k))},updateRecordArrays:function(b,c,d){var e=this.typeMapFor(b).recordArrays,f;e.forEach(function(e){f=a(e,"filterFunction"),this.updateRecordArray(e,f,b,c,d)},this)},updateRecordArray:function(b,c,d,e,f){var g;c?g=c(f):g=!0;var h=a(b,"content"),i=h.indexOf(e)!==-1,j=this.recordArraysForClientId(e);g&&!i?(j.add(b),h.pushObject(e)):!g&&i&&(j.remove(b),h.removeObject(e))},removeFromRecordArrays:function(b){var c=a(b,"clientId"),d=this.recordArraysForClientId(c);d.forEach(function(b){var d=a(b,"content");d.removeObject(c)})},recordArraysForClientId:function(b){var c=a(this,"recordArraysByClientId"),d=c[b];return d||(d=c[b]=Ember.OrderedSet.create()),d},typeMapFor:function(b){var c=a(this,"typeMaps"),d=Ember.guidFor(b),e=c[d];return e?e:c[d]={idToCid:{},clientIds:[],cidToHash:{},recordArrays:[]}},clientIdForId:function(a,b){var c=this.typeMapFor(a).idToCid[b];return c!==undefined?c:this.pushHash(f,b,a)},load:function(b,c,d){if(d===undefined){d=c;var f=b.proto().primaryKey;c=d[f]}var g=this.typeMapFor(b),h=g.cidToHash,i=g.idToCid[c],j=a(this,"recordCache");if(i!==undefined){h[i]=d;var k=j[i];k&&k.send("didChangeData")}else i=this.pushHash(d,c,b);return e.savedData=d,this.updateRecordArrays(b,i,e),{id:c,clientId:i}},loadMany:function(b,c,d){var e=Ember.A([]);if(d===undefined){d=c,c=[];var f=b.proto().primaryKey;c=Ember.ArrayUtils.map(d,function(a){return a[f]})}for(var g=0,h=a(c,"length");g<h;g++){var i=this.load(b,c[g],d[g]);e.pushObject(i.clientId)}return{clientIds:e,ids:c}},pushHash:function(a,b,c){var d=this.typeMapFor(c),e=d.idToCid,f=this.clientIdToId,g=d.clientIds,h=d.cidToHash,i=++this.clientIdCounter;return h[i]=a,b&&(e[b]=i,f[i]=b),g.push(i),i},materializeRecord:function(b,c){var d;return a(this,"recordCache")[c]=d=b._create({store:this,clientId:c}),a(this,"defaultTransaction").adoptRecord(d),d.send("loadingData"),d},destroy:function(){return a(DS,"defaultStore")===this&&b(DS,"defaultStore",null),this._super()}})}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath,d=Ember.guidFor,e=Ember.computed(function(b){var c=a(this,"parentState");if(c)return a(c,b)}).property(),f=function(a){for(var b in a)if(a.hasOwnProperty(b))return!1;return!0},g=function(a){for(var b in a)if(a.hasOwnProperty(b)&&a[b])return!0;return!1};DS.State=Ember.State.extend({isLoaded:e,isDirty:e,isSaving:e,isDeleted:e,isError:e,isNew:e,isValid:e,isPending:e,dirtyType:e});var h=function(c,d){var e=d.key,f=d.value,g=a(c,"record"),h=a(g,"data");b(h,e,f)},i=function(b,c){var d=c.key,e=c.value,f=a(b,"record"),g=a(f,"data");g.setAssociation(d,e)},j=function(b){var c=a(b,"record"),d=a(c,"data");d._savedData=null,c.notifyPropertyChange("data")},k=function(b,c){var e=a(b,"record"),f=a(e,"pendingQueue"),g=d(c),h=function(){a(c,"id")&&(b.send("doneWaitingOn",c),Ember.removeObserver(c,"id",h))};f[g]=[c,h],Ember.addObserver(c,"id",h)},l=Ember.Mixin.create({setProperty:h,setAssociation:i}),m=Ember.Mixin.create({deleteRecord:function(b){var c=a(b,"record");this._super(b),c.withTransaction(function(a){a.recordBecameClean("created",c)}),b.goToState("deleted.saved")}}),n=Ember.Mixin.create({deleteRecord:function(b){this._super(b);var c=a(b,"record");c.withTransaction(function(a){a.recordBecameClean("updated",c)}),b.goToState("deleted")}}),o=DS.State.extend({initialState:"uncommitted",isDirty:!0,uncommitted:DS.State.extend({enter:function(b){var c=a(this,"dirtyType"),d=a(b,"record");d.withTransaction(function(a){a.recordBecameDirty(c,d)})},exit:function(b){var c=a(b,"record");b.send("invokeLifecycleCallbacks",c)},deleteRecord:Ember.K,waitingOn:function(a,b){k(a,b),a.goToState("pending")},willCommit:function(a){a.goToState("inFlight")},rollback:function(b){var c=a(b,"record"),d=a(this,"dirtyType"),e=a(c,"data");e.rollback(),c.withTransaction(function(a){a.recordBecameClean(d,c)}),b.goToState("loaded")}},l),inFlight:DS.State.extend({isSaving:!0,enter:function(b){var c=a(this,"dirtyType"),d=a(b,"record");d.withTransaction(function(a){a.recordBecameClean(c,d)})},didCommit:function(a){a.goToState("loaded")},becameInvalid:function(c,d){var e=a(c,"record");b(e,"errors",d),c.goToState("invalid")},didChangeData:j}),pending:DS.State.extend({initialState:"uncommitted",isPending:!0,uncommitted:DS.State.extend({deleteRecord:function(b){var c=a(b,"record"),d=a(c,"pendingQueue"),e;for(var f in d){if(!d.hasOwnProperty(f))continue;e=d[f],Ember.removeObserver(e[0],"id",e[1])}},willCommit:function(a){a.goToState("committing")},doneWaitingOn:function(b,c){var e=a(b,"record"),g=a(e,"pendingQueue"),h=d(c);delete g[h],f(g)&&b.send("doneWaiting")},doneWaiting:function(b){var c=a(this,"dirtyType");b.goToState(c+".uncommitted")}},l),committing:DS.State.extend({isSaving:!0,doneWaitingOn:function(b,c){var e=a(b,"record"),g=a(e,"pendingQueue"),h=d(c);delete g[h],f(g)&&b.send("doneWaiting")},doneWaiting:function(b){var c=a(b,"record"),d=a(c,"transaction");Ember.run.once(d,d.commit)},willCommit:function(b){var c=a(this,"dirtyType");b.goToState(c+".inFlight")}})}),invalid:DS.State.extend({isValid:!1,deleteRecord:function(a){a.goToState("deleted")},setAssociation:i,setProperty:function(b,c){h(b,c);var d=a(b,"record"),e=a(d,"errors"),f=c.key;delete e[f],g(e)||b.send("becameValid")},becameValid:function(a){a.goToState("uncommitted")}})}),p=o.create({dirtyType:"created",isNew:!0,invokeLifecycleCallbacks:function(a,b){b.fire("didCreate")}}),q=o.create({dirtyType:"updated",invokeLifecycleCallbacks:function(a,b){b.fire("didUpdate")}});p.states.uncommitted.reopen(m),p.states.pending.states.uncommitted.reopen(m),p.states.uncommitted.reopen({rollback:function(a){this._super(a),a.goToState("deleted.saved")}}),q.states.uncommitted.reopen(n),q.states.pending.states.uncommitted.reopen(n);var r={rootState:Ember.State.create({isLoaded:!1,isDirty:!1,isSaving:!1,isDeleted:!1,isError:!1,isNew:!1,isValid:!0,isPending:!1,empty:DS.State.create({loadingData:function(a){a.goToState("loading")},didChangeData:function(a){j(a),a.goToState("loaded.created")}}),loading:DS.State.create({exit:function(b){var c=a(b,"record");c.fire("didLoad")},didChangeData:function(a,b){j(a),a.send("loadedData")},loadedData:function(a){a.goToState("loaded")}}),loaded:DS.State.create({initialState:"saved",isLoaded:!0,saved:DS.State.create({setProperty:function(a,b){h(a,b),a.goToState("updated")},setAssociation:function(a,b){i(a,b),a.goToState("updated")},didChangeData:j,deleteRecord:function(a){a.goToState("deleted")},waitingOn:function(a,b){k(a,b),a.goToState("updated.pending")}}),created:p,updated:q}),deleted:DS.State.create({isDeleted:!0,isLoaded:!0,isDirty:!0,enter:function(b){var c=a(b,"record"),d=a(c,"store");d.removeFromRecordArrays(c)},start:DS.State.create({enter:function(b){var c=a(b,"record");c.withTransaction(function(a){a.recordBecameDirty("deleted",c)})},willCommit:function(a){a.goToState("inFlight")},rollback:function(b){var c=a(b,"record"),d=a(c,"data");d.rollback(),c.withTransaction(function(a){a.recordBecameClean("deleted",c)}),b.goToState("loaded")}}),inFlight:DS.State.create({isSaving:!0,exit:function(b){var c=a(b,"record");c.withTransaction(function(a){a.recordBecameClean("deleted",c)})},didCommit:function(a){a.goToState("saved")}}),saved:DS.State.create({isDirty:!1})}),error:DS.State.create({isError:!0})})};DS.StateManager=Ember.StateManager.extend({record:null,initialState:"rootState",states:r})}(),function(){var a=Ember.get,b=Ember.set,c=DS._DataProxy=function(a){this.record=a,this.unsavedData={},this.associations={}};c.prototype={get:function(a){return Ember.get(this,a)},set:function(a,b){return Ember.set(this,a,b)},setAssociation:function(a,b){this.associations[a]=b},savedData:function(){var b=this._savedData;if(b)return b;var c=this.record,d=a(c,"clientId"),e=a(c,"store");if(e)return b=e.dataForRecord(c),this._savedData=b,b},unknownProperty:function(b){var c=this.unsavedData,d=this.associations,e=this.savedData(),f,g=c[b],h;return h=d[b],h!==undefined?(f=a(this.record,"store"),f.clientIdToId[h]):(e&&g===undefined&&(g=e[b]),g)},setUnknownProperty:function(a,b){var c=this.record,d=this.unsavedData;return d[a]=b,c.hashWasUpdated(),b},commit:function(){var a=this.record,b=this.unsavedData,c=this.savedData();for(var d in b)b.hasOwnProperty(d)&&(c[d]=b[d],delete b[d]);a.notifyPropertyChange("data")},rollback:function(){this.unsavedData={},this.record.notifyPropertyChange("data")},adapterDidUpdate:function(a){this.unsavedData={}}}}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath,d=Ember.none,e=Ember.computed(function(b){return a(c(this,"stateManager.currentState"),b)}).property("stateManager.currentState").cacheable();DS.Model=Ember.Object.extend(Ember.Evented,{isLoaded:e,isDirty:e,isSaving:e,isDeleted:e,isError:e,isNew:e,isPending:e,isValid:e,clientId:null,transaction:null,stateManager:null,pendingQueue:null,errors:null,primaryKey:"id",id:Ember.computed(function(c,d){var e=a(this,"primaryKey"),f=a(this,"data");return arguments.length===2?(b(f,e,d),d):f&&a(f,e)}).property("primaryKey","data"),addIdToJSON:function(a,b,c){b&&(a[c]=b)},addAttributesToJSON:function(b,c,d){c.forEach(function(c,e){var f=e.key(this.constructor),g=a(d,f);g===undefined&&(g=e.options.defaultValue),b[f]=g},this)},addHasManyToJSON:function(b,c,d,e){var f=d.key,g=a(this,f),h=[],i,j;if(d.options.embedded)g.forEach(function(a){h.push(a.toJSON(e))});else{var k=a(g,"content");for(var l=0,m=k.length;l<m;l++)i=k[l],j=a(this,"store").clientIdToId[i],j!==undefined&&h.push(j)}f=e.key||a(this,"namingConvention").keyToJSONKey(f),b[f]=h},addBelongsToToJSON:function(b,c,e,f){var g=e.key,h,i;f.embedded?(g=f.key||a(this,"namingConvention").keyToJSONKey(g),h=a(c.record,g),b[g]=h?h.toJSON(f):null):(g=f.key||a(this,"namingConvention").foreignKey(g),i=c.get(g),b[g]=d(i)?null:i)},toJSON:function(b){var c=a(this,"data"),d={},e=this.constructor,f=a(e,"attributes"),g=a(this,"primaryKey"),h=a(this,"id"),i=a(this,"store"),j;return b=b||{},this.addIdToJSON(d,h,g),this.addAttributesToJSON(d,f,c),j=a(e,"associationsByName"),j.forEach(function(a,e){b.associations&&e.kind==="hasMany"?this.addHasManyToJSON(d,c,e,b):e.kind==="belongsTo"&&this.addBelongsToToJSON(d,c,e,b)},this),d},data:Ember.computed(function(){return new DS._DataProxy(this)}).cacheable(),didLoad:Ember.K,didUpdate:Ember.K,didCreate:Ember.K,init:function(){var a=DS.StateManager.create({record:this});b(this,"pendingQueue",{}),b(this,"stateManager",a),a.goToState("empty")},destroy:function(){a(this,"isDeleted")||this.deleteRecord(),this._super()},send:function(b,c){return a(this,"stateManager").send(b,c)},withTransaction:function(b){var c=a(this,"transaction");c&&b(c)},setProperty:function(a,b){this.send("setProperty",{key:a,value:b})},deleteRecord:function(){this.send("deleteRecord")},waitingOn:function(a){this.send("waitingOn",a)},notifyHashWasUpdated:function(){var b=a(this,"store");b&&b.hashWasUpdated(this.constructor,a(this,"clientId"),this)},unknownProperty:function(b){var c=a(this,"data");!(c&&b in c)},setUnknownProperty:function(b,c){var d=a(this,"data");if(!(d&&b in d))return this._super(b,c)},namingConvention:{keyToJSONKey:function(a){return Ember.String.decamelize(a)},foreignKey:function(a){return Ember.String.decamelize(a)+"_id"}},hashWasUpdated:function(){Ember.run.once(this,this.notifyHashWasUpdated)},dataDidChange:Ember.observer(function(){var c=a(this.constructor,"associationsByName"),d=a(this,"data"),e=a(this,"store"),f=e.idToClientId,g;c.forEach(function(a,c){if(c.kind==="hasMany"){g=this.cacheFor(a);if(g){var f=d.get(a)||[],h=Ember.ArrayUtils.map(f,function(a){return e.clientIdForId(c.type,a)});b(g,"content",Ember.A(h)),g.fetch()}}},this)},"data"),fire:function(a){this[a].apply(this,[].slice.call(arguments,1)),this._super.apply(this,arguments)}});var f=function(b){return function(){var c=a(DS,"defaultStore"),d=[].slice.call(arguments);return d.unshift(this),c[b].apply(c,d)}};DS.Model.reopenClass({find:f("find"),filter:f("filter"),_create:DS.Model.create,create:function(){throw new Ember.Error("You should not call `create` on a model. Instead, call `createRecord` with the attributes you would like to set.")},createRecord:f("createRecord")})}(),function(){var a=Ember.get,b=Ember.getPath;DS.Model.reopenClass({attributes:Ember.computed(function(){var a=Ember.Map.create();return this.eachComputedProperty(function(b,c){c.isAttribute&&a.set(b,c)}),a}).cacheable(),processAttributeKeys:function(){if(this.processedAttributeKeys)return;var a=this.proto().namingConvention;this.eachComputedProperty(function(b,c){c.isAttribute&&!c.options.key&&(c.options.key=a.keyToJSONKey(b,this))},this)}}),DS.attr=function(b,c){var d=DS.attr.transforms[b],e=d.from,f=d.to;c=c||{};var g={type:b,isAttribute:!0,options:c,key:function(a){return a.processAttributeKeys(),c.key}};return Ember.computed(function(b,d){var h;return b=g.key(this.constructor),arguments.length===2?(d=f(d),this.setProperty(b,d)):(h=a(this,"data"),d=a(h,b),d===undefined&&(d=c.defaultValue)),e(d)}).property("data").cacheable().meta(g)},DS.attr.transforms={string:{from:function(a){return Ember.none(a)?null:String(a)},to:function(a){return Ember.none(a)?null:String(a)}},number:{from:function(a){return Ember.none(a)?null:Number(a)},to:function(a){return Ember.none(a)?null:Number(a)}},"boolean":{from:function(a){return Boolean(a)},to:function(a){return Boolean(a)}},date:{from:function(a){var b=typeof a;return b==="string"||b==="number"?new Date(a):a===null||a===undefined?a:null},to:function(a){if(a instanceof Date){var b=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],c=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],d=function(a){return a<10?"0"+a:""+a},e=a.getUTCFullYear(),f=a.getUTCMonth(),g=a.getUTCDate(),h=a.getUTCDay(),i=a.getUTCHours(),j=a.getUTCMinutes(),k=a.getUTCSeconds(),l=b[h],m=d(g),n=c[f];return l+", "+m+" "+n+" "+e+" "+d(i)+":"+d(j)+":"+d(k)+" GMT"}return a===undefined?undefined:null}}}}(),function(){}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath,d=Ember.none,e=function(b,c,e,f,g){var h=a(e,f);return d(h)?undefined:b.load(c,h).id},f=function(b,c,d,e,f){return a(d,e)},g=function(b,d,g){d=d||{};var h=d.embedded,i=h?e:f,j={type:b,isAssociation:!0,options:d,kind:"belongsTo"};return Ember.computed(function(e,f){var g=a(this,"data"),j,k,l,m=a(this,"store");return typeof b=="string"&&(b=c(this,b,!1)||c(window,b)),arguments.length===2?(e=d.key||a(this,"namingConvention").foreignKey(e),this.send("setAssociation",{key:e,value:f===null?null:a(f,"clientId")}),f):(h?e=d.key||a(this,"namingConvention").keyToJSONKey(e):e=d.key||a(this,"namingConvention").foreignKey(e),k=i(m,b,g,e,!0),l=k?m.find(b,k):null,l)}).property("data").cacheable().meta(j)};DS.belongsTo=function(a,b){return g(a,b)}}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath,d=function(b,c,d,e){var f=a(d,e);return f?b.loadMany(c,f).ids:[]},e=function(b,c,d,e,f){return a(d,e)},f=function(f,g){g=g||{};var h=g.embedded,i=h?d:e,j={type:f,isAssociation:!0,options:g,kind:"hasMany"};return Ember.computed(function(d,e){var h=a(this,"data"),j=a(this,"store"),k,l,m;return typeof f=="string"&&(f=c(this,f,!1)||c(window,f)),d=g.key||a(this,"namingConvention").keyToJSONKey(d),k=i(j,f,h,d),m=j.findMany(f,k),b(m,"parentRecord",this),m}).property().cacheable().meta(j)};DS.hasMany=function(a,b){return f(a,b)}}(),function(){var a=Ember.get,b=Ember.getPath;DS.Model.reopenClass({typeForAssociation:function(b){var c=a(this,"associationsByName").get(b);return c&&c.type},associations:Ember.computed(function(){var a=Ember.Map.create();return this.eachComputedProperty(function(c,d){if(d.isAssociation){var e=d.type,f=a.get(e);typeof e=="string"&&(e=b(this,e,!1)||b(window,e),d.type=e),f||(f=[],a.set(e,f)),f.push({name:c,kind:d.kind})}}),a}).cacheable(),associationsByName:Ember.computed(function(){var a=Ember.Map.create(),c;return this.eachComputedProperty(function(d,e){e.isAssociation&&(e.key=d,c=e.type,typeof c=="string"&&(c=b(this,c,!1)||b(window,c),e.type=c),a.set(d,e))}),a}).cacheable()})}(),function(){}(),function(){DS.Adapter=Ember.Object.extend({find:null,generateIdForRecord:null,commit:function(a,b){b.updated.eachType(function(b,c){this.updateRecords(a,b,c.slice())},this),b.created.eachType(function(b,c){this.createRecords(a,b,c.slice())},this),b.deleted.eachType(function(b,c){this.deleteRecords(a,b,c.slice())},this)},createRecords:function(a,b,c){c.forEach(function(c){this.createRecord(a,b,c)},this)},updateRecords:function(a,b,c){c.forEach(function(c){this.updateRecord(a,b,c)},this)},deleteRecords:function(a,b,c){c.forEach(function(c){this.deleteRecord(a,b,c)},this)},findMany:function(a,b,c){c.forEach(function(c){this.find(a,b,c)},this)}})}(),function(){DS.fixtureAdapter=DS.Adapter.create({find:function(a,b,c){var d=b.FIXTURES;if(d.hasLoaded)return;setTimeout(function(){a.loadMany(b,d),d.hasLoaded=!0},300)},findMany:function(){this.find.apply(this,arguments)},findAll:function(a,b){var c=b.FIXTURES,d=c.map(function(a,b,c){return a.id});a.loadMany(b,d,c)}})}(),function(){var a=Ember.get,b=Ember.set,c=Ember.getPath;DS.RESTAdapter=DS.Adapter.extend({createRecord:function(a,b,c){var d=this.rootForType(b),e={};e[d]=c.toJSON(),this.ajax(this.buildURL(d),"POST",{data:e,success:function(e){this.sideload(a,b,e,d),a.didCreateRecord(c,e[d])}})},createRecords:function(b,c,d){if(a(this,"bulkCommit")===!1)return this._super(b,c,d);var e=this.rootForType(c),f=this.pluralize(e),g={};g[f]=d.map(function(a){return a.toJSON()}),this.ajax(this.buildURL(e),"POST",{data:g,success:function(a){this.sideload(b,c,a,f),b.didCreateRecords(c,d,a[f])}})},updateRecord:function(b,c,d){var e=a(d,"id"),f=this.rootForType(c),g={};g[f]=d.toJSON(),this.ajax(this.buildURL(f,e),"PUT",{data:g,success:function(a){this.sideload(b,c,a,f),b.didUpdateRecord(d,a&&a[f])}})},updateRecords:function(b,c,d){if(a(this,"bulkCommit")===!1)return this._super(b,c,d);var e=this.rootForType(c),f=this.pluralize(e),g={};g[f]=d.map(function(a){return a.toJSON()}),this.ajax(this.buildURL(e,"bulk"),"PUT",{data:g,success:function(a){this.sideload(b,c,a,f),b.didUpdateRecords(d,a[f])}})},deleteRecord:function(b,c,d){var e=a(d,"id"),f=this.rootForType(c);this.ajax(this.buildURL(f,e),"DELETE",{success:function(a){a&&this.sideload(b,c,a),b.didDeleteRecord(d)}})},deleteRecords:function(b,c,d){if(a(this,"bulkCommit")===!1)return this._super(b,c,d);var e=this.rootForType(c),f=this.pluralize(e),g={};g[f]=d.map(function(b){return a(b,"id")}),this.ajax(this.buildURL(e,"bulk"),"DELETE",{data:g,success:function(a){a&&this.sideload(b,c,a),b.didDeleteRecords(d)}})},find:function(a,b,c){var d=this.rootForType(b);this.ajax(this.buildURL(d,c),"GET",{success:function(c){a.load(b,c[d]),this.sideload(a,b,c,d)}})},findMany:function(a,b,c){var d=this.rootForType(b),e=this.pluralize(d);this.ajax(this.buildURL(d),"GET",{data:{ids:c},success:function(d){a.loadMany(b,c,d[e]),this.sideload(a,b,d,e)}})},findAll:function(a,b){var c=this.rootForType(b),d=this.pluralize(c);this.ajax(this.buildURL(c),"GET",{success:function(c){a.loadMany(b,c[d]),this.sideload(a,b,c,d)}})},findQuery:function(a,b,c,d){var e=this.rootForType(b),f=this.pluralize(e);this.ajax(this.buildURL(e),"GET",{data:c,success:function(c){d.load(c[f]),this.sideload(a,b,c,f)}})},plurals:{},pluralize:function(a){return this.plurals[a]||a+"s"},rootForType:function(a){if(a.url)return a.url;var b=a.toString().split("."),c=b[b.length-1];return c.replace(/([A-Z])/g,"_$1").toLowerCase().slice(1)},ajax:function(a,b,c){c.url=a,c.type=b,c.dataType="json",c.contentType="application/json",c.context=this,c.data&&b!=="GET"&&(c.data=JSON.stringify(c.data)),jQuery.ajax(c)},sideload:function(b,c,d,e){var f,g;for(var h in d){if(!d.hasOwnProperty(h))continue;if(h===e)continue;f=c.typeForAssociation(h),f||(g=a(this,"mappings"),f=a(a(this,"mappings"),h)),this.loadValue(b,f,d[h])}},loadValue:function(a,b,c){c instanceof Array?a.loadMany(b,c):a.load(b,c)},buildURL:function(a,b){var c=[""];return this.namespace!==undefined&&c.push(this.namespace),c.push(this.pluralize(a)),b!==undefined&&c.push(b),c.join("/")}})}(),function(){}()
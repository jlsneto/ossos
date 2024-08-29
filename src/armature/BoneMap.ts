// #region IMPORTS
import Armature from './Armature';
import Bone     from './Bone';
import Pose     from './Pose';
// #endregion

export default class BoneMap {
    bones : Map<string, BoneInfo> = new Map();
    obj  !: Armature | Pose;

    constructor( obj ?: Armature | Pose ){
        if( obj ) this.from( obj );
    }

    from( obj: Armature | Pose ){
        this.obj = obj;

        const bAry = (obj instanceof Armature)? obj.bindPose.bones : obj.bones;
        let bp  : BoneParse;
        let bi  : BoneInfo | undefined;
        let key : string | null;

        for( const b of bAry ){
            // console.log( 'Bone: ', b.name );
            for( bp of Parsers ){
                // Can generate universal bone key?
                if( !(key = bp.test( b.name )) ) continue;
                bi = this.bones.get( key );

                // console.log( '---', key );

                // Get bone info, else create if doesn't exist
                if( !bi ) this.bones.set( key, new BoneInfo( b ) );

                // If found & is a chain, push extra bones
                else if( bi && bp.isChain ) bi.push( b );

                break;
            }
        }
    }

    getBoneMap( name: string ): BoneInfo | undefined{ return this.bones.get( name ); }

    getBoneIndex( name:string ): number{
        const bi = this.bones.get( name );
        return ( bi )? bi.items[0].index : -1;
    }

    getBones( aryNames: Array<string> ): Array<Bone> | null{
        const bAry = ( this.obj instanceof Armature)? this.obj.bindPose.bones : this.obj.bones;
        const rtn : Array<Bone> = [];

        let bi: BoneInfo | undefined;
        let i : BoneInfoItem;
        for( const name of aryNames ){
            bi = this.bones.get( name );
            if( bi ){
                for( i of bi.items ) rtn.push( bAry[ i.index ] );
            }else{
                console.warn( 'Bonemap.getBones - Bone not found', name );
            }
        }

        return ( rtn.length >= aryNames.length )? rtn : null;
    }

    getBoneNames( ary: Array<string> ): Array<string> | null{
        const rtn : Array<string> = [];
        let bi    : BoneInfo | undefined;
        let i     : BoneInfoItem;

        for( const name of ary ){
            if( ( bi = this.bones.get( name ) ) ){
                for( i of bi.items ) rtn.push( i.name );
            }else{
                console.warn( 'Bonemap.getBoneNames - Bone not found', name );
                return null;
            }
        }

        return rtn;
    }

    getChestBone(): Array<Bone> | null{
        const bAry = ( this.obj instanceof Armature )? this.obj.bindPose.bones : this.obj.bones;
        const rtn : Array<Bone> = [];

        const bi   = this.bones.get( 'spine' );
        if( bi ){
            rtn.push( bAry[ bi.lastIndex ] );
        }

        return ( rtn.length > 0 )? rtn : null;
    }
}

// #region DATA STRUCTURES
type BoneInfoItem = {
    index : number,
    name  : string,
};

export class BoneInfo {
    items: Array< BoneInfoItem > = [];

    constructor( b ?: Bone ){
        if( b ) this.push( b );
    }

    push( bone: Bone ): this{
        this.items.push({ index: bone.index, name: bone.name });
        return this
    }

    get isChain(): boolean{ return ( this.items.length > 1 ); }
    get count(): number{ return this.items.length; }
    get index(): number{ return this.items[0].index; }
    get lastIndex(): number{ return this.items[ this.items.length-1 ].index; }
}
// #endregion

// #region NAME PARSING

class BoneParse {
    name        : string;
    isLR        : boolean;
    isChain     : boolean;
    reFind      : RegExp;
    reExclude  ?: RegExp;

    constructor( name: string, isLR: boolean, reFind :string, reExclude?: string, isChain=false ){
        this.name       = name;
        this.isLR       = isLR;
        this.isChain    = isChain;
        this.reFind     = new RegExp( reFind, 'i' );
        if( reExclude ) this.reExclude = new RegExp( reExclude, 'i' );
    }

    test( bname: string ): string | null{
        if( !this.reFind.test( bname ) )                     return null;
        if( this.reExclude && this.reExclude.test( bname ) ) return null;

        if( this.isLR && reLeft.test( bname ) )  return this.name + '_l';
        if( this.isLR && reRight.test( bname ) ) return this.name + '_r';

        return this.name;
    }
}

const reLeft    = new RegExp( '\\.l|left|_l', 'i' );
const reRight   = new RegExp( '\\.r|right|_r', 'i' );

const Parsers   = [
    new BoneParse( 'thigh',     true, 'thigh|up.*leg', 'twist' ), //upleg | upperleg
    new BoneParse( 'shin',      true, 'shin|leg|calf', 'up|twist' ),
    new BoneParse( 'foot',      true, 'foot' ),
    new BoneParse( 'toe',       true, 'toe' ),
    new BoneParse( 'shoulder',  true, 'clavicle|shoulder' ),
    new BoneParse( 'upperarm',  true, '(upper.*arm|arm)', 'fore|twist|lower' ),
    new BoneParse( 'forearm',   true, 'forearm|arm', 'up|twist' ),
    new BoneParse( 'hand',      true, 'hand', 'thumb|index|middle|ring|pinky' ),

    new BoneParse( 'head',      false, 'head' ),
    new BoneParse( 'neck',      false, 'neck' ),
    new BoneParse( 'hip',       false, 'hips*|pelvis' ),
    new BoneParse( 'root',      false, 'root' ),
    new BoneParse("finger_thumb1", true, "thumb1|thumb.*1", undefined, false),
    new BoneParse("finger_index1", true, "index1|index.*1", undefined, false),
    new BoneParse("finger_middle1", true, "middle1|middle.*1", undefined, false),
    new BoneParse("finger_ring1", true, "ring1|ring.*1", undefined, false),
    new BoneParse("finger_pinky1", true, "pinky1|pinky.*1", undefined, false),

    new BoneParse("finger_thumb2", true, "thumb2|thumb.*2", undefined, false),
    new BoneParse("finger_index2", true, "index2|index.*2", undefined, false),
    new BoneParse("finger_middle2", true, "middle2|middle.*2", undefined, false),
    new BoneParse("finger_ring2", true, "ring2|ring.*2", undefined, false),
    new BoneParse("finger_pinky2", true, "pinky2|pinky.*2", undefined, false),

    new BoneParse("finger_thumb3", true, "thumb3|thumb.*3", undefined, false),
    new BoneParse("finger_index3", true, "index3|index.*3", undefined, false),
    new BoneParse("finger_middle3", true, "middle3|middle.*3", undefined, false),
    new BoneParse("finger_ring3", true, "ring3|ring.*3", undefined, false),
    new BoneParse("finger_pinky3", true, "pinky3|pinky.*3", undefined, false),
    // eslint-disable-next-line no-useless-escape
    new BoneParse( 'spine',     false, 'spine.*\d*|chest', undefined, true ),
];

// #endregion
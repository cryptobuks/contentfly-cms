<?php
namespace Areanet\PIM\Classes\Annotations;

use Doctrine\Common\Annotations\Annotation;

/**
 * @Annotation
 */
final class Select extends Annotation
{
    /**
     * @var string
     */
    public $options = null;
}
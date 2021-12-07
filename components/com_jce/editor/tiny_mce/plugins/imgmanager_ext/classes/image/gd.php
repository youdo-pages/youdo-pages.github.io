<?php

/**
 * @copyright   Copyright (C) 2005 - 2012 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE
 * 
 * Based on JImage library from Joomla.Platform 11.3
 */
defined('_JEXEC') or die;

// load filter class
require_once(dirname(__FILE__) . '/gd/filter.php');

/**
 * Class to manipulate an image.
 *
 * @package     Joomla.Platform
 * @subpackage  Image
 * @since       11.3
 */
class WFImageGD {

    /**
     * @var    resource  The image resource handle.
     * @since  11.3
     */
    protected $handle;

    /**
     * @var    string  The source image path.
     * @since  11.3
     */
    protected $path = null;

    /**
     * @var    array  Whether or not different image formats are supported.
     * @since  11.3
     */
    protected static $formats = array();

    /**
     * Class constructor.
     *
     * @param   mixed  $source  Either a file path for a source image or a GD resource handler for an image.
     *
     * @since   11.3
     * @throws  RuntimeException
     */
    public function __construct($source = null) {
        // Verify that GD support for PHP is available.
        if (!extension_loaded('gd')) {
            throw new RuntimeException('The GD extension for PHP is not available.');
        }

        // Determine which image types are supported by GD, but only once.
        if (!isset(self::$formats[IMAGETYPE_JPEG])) {
            $info = gd_info();
            self::$formats[IMAGETYPE_JPEG] = ($info['JPEG Support']) ? true : false;

            if (self::$formats[IMAGETYPE_JPEG] === false) {
                self::$formats[IMAGETYPE_JPEG] = ($info['JPG Support']) ? true : false;
            }

            self::$formats[IMAGETYPE_PNG] = ($info['PNG Support']) ? true : false;
            self::$formats[IMAGETYPE_GIF] = ($info['GIF Read Support']) ? true : false;
        }

        // If the source input is a resource, set it as the image handle.
        if (is_resource($source) && (get_resource_type($source) == 'gd')) {
            $this->handle = &$source;
        } elseif (!empty($source) && is_string($source)) {
            // If the source input is not empty, assume it is a path and populate the image handle.
            $this->loadFile($source);
        }
    }

    /**
     * Method to apply a filter to the image by type.  Two examples are: grayscale and sketchy.
     *
     * @param   string  $type     The name of the image filter to apply.
     * @param   array   $options  An array of options for the filter.
     *
     * @return  JImage
     *
     * @since   11.3
     * @see     JImageFilter
     * @throws  LogicException
     * @throws  RuntimeException
     */
    public function filter($type, array $options = array()) {
        // Get the image filter instance.
        $filter = $this->getFilterInstance($type);

        // Execute the image filter.
        $filter->execute($options);

        return $this;
    }

    private static function checkMem($image) {
        $channels = ($image->mime == 'image/png') ? 4 : 3;

        if (function_exists('memory_get_usage')) {
            // calculate memory limit as 20% of available memory
            $limit = round(max(intval(ini_get('memory_limit')), intval(get_cfg_var('memory_limit'))) * 1048576);

            // assume default of 32MB
            if (!$limit) {
                $limit = 32 * 1048576;
            }
            
            $used = memory_get_usage(true);
            return $image->width * $image->height * $channels * 1.7 < $limit - $used;
        }
        
        return true;
    }

    /**
     * Method to get the height of the image in pixels.
     *
     * @return  integer
     *
     * @since   11.3
     * @throws  LogicException
     */
    public function getHeight() {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        return imagesy($this->handle);
    }

    /**
     * Method to get the width of the image in pixels.
     *
     * @return  integer
     *
     * @since   11.3
     * @throws  LogicException
     */
    public function getWidth() {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        return imagesx($this->handle);
    }

    /**
     * Method to return the path
     *
     * @return	string
     *
     * @since	11.3
     */
    public function getPath() {
        return $this->path;
    }

    /**
     * Method to determine whether or not an image has been loaded into the object.
     *
     * @return  bool
     *
     * @since   11.3
     */
    public function isLoaded() {
        // Make sure the resource handle is valid.
        if (!is_resource($this->handle) || (get_resource_type($this->handle) != 'gd')) {
            return false;
        }

        return true;
    }

    /**
     * Method to determine whether or not the image has transparency.
     *
     * @return  bool
     *
     * @since   11.3
     * @throws  LogicException
     */
    public function isTransparent() {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        return (imagecolortransparent($this->handle) >= 0);
    }

    /**
     * Method to load a file into the JImage object as the resource.
     *
     * @param   string  $path  The filesystem path to load as an image.
     *
     * @return  void
     *
     * @since   11.3
     * @throws  InvalidArgumentException
     * @throws  RuntimeException
     */
    public function loadFile($path) {
        // Make sure the file exists.
        if (!file_exists($path)) {
            throw new InvalidArgumentException('The image file does not exist.');
        }

        $properties = WFImage::getImageFileProperties($path);

        if (self::checkMem($properties) === false) {
            throw new RuntimeException('Insufficient memory available to process this image.');
        }

        // Attempt to load the image based on the MIME-Type
        switch ($properties->mime) {
            case 'image/gif':
                // Make sure the image type is supported.
                if (empty(self::$formats[IMAGETYPE_GIF])) {
                    throw new RuntimeException('Attempting to load an image of unsupported type GIF.');
                }

                // Attempt to create the image handle.
                $handle = imagecreatefromgif($path);
                if (!is_resource($handle)) {
                    throw new RuntimeException('Unable to process GIF image.');
                }
                $this->handle = $handle;
                break;

            case 'image/jpeg':
                // Make sure the image type is supported.
                if (empty(self::$formats[IMAGETYPE_JPEG])) {
                    throw new RuntimeException('Attempting to load an image of unsupported type JPG.');
                }

                // Attempt to create the image handle.
                $handle = imagecreatefromjpeg($path);
                if (!is_resource($handle)) {
                    throw new RuntimeException('Unable to process JPG image.');
                }
                $this->handle = $handle;
                break;

            case 'image/png':
                // Make sure the image type is supported.
                if (empty(self::$formats[IMAGETYPE_PNG])) {
                    throw new RuntimeException('Attempting to load an image of unsupported type PNG.');
                }

                // Attempt to create the image handle.
                $handle = imagecreatefrompng($path);
                if (!is_resource($handle)) {
                    throw new RuntimeException('Unable to process PNG image.');
                }
                $this->handle = $handle;
                break;

            default:
                throw new InvalidArgumentException('Attempting to load an image of unsupported type: ' . $properties->mime);
                break;
        }

        // Set the filesystem path to the source image.
        $this->path = $path;
    }

    /**
     * Method to load a file into the JImage object as the resource.
     *
     * @param   string  $path  The filesystem path to load as an image.
     *
     * @return  void
     *
     * @since   11.3
     * @throws  InvalidArgumentException
     * @throws  RuntimeException
     */
    public function loadString($string) {
        $handle = imagecreatefromstring($string);

        if (is_resource($handle) && get_resource_type($handle) == 'gd') {
            $this->handle = $handle;
        } else {
            imagedestroy($handle);
            throw new RuntimeException('Attempting to load an image of unsupported type.');
        }
    }

    private function getWatermarkPosition($options, $mw, $mh) {
        $width = $this->getWidth();
        $height = $this->getHeight();

        switch ($options->position) {
            default:
            case 'center':
                $x = floor(($width - $mw) / 2);
                $y = floor(($height - $mh) / 2);
                break;
            case 'top-left':
                $x = $options->margin;
                $y = floor($mh / 2) + $options->margin;
                break;
            case 'top-right':
                $x = $width - $mw - $options->margin;
                $y = floor($mh / 2) + $options->margin;
                break;
            case 'center-left':
                $x = 0 + $options->margin;
                $y = floor(($height - $mh) / 2);

                break;
            case 'center-right':
                $x = $width - $mw - $options->margin;
                $y = floor(($height - $mh) / 2);

                break;
            case 'top-center':
                $x = floor(($width - $mw) / 2);
                $y = floor($mh / 2) + $options->margin;
                break;
            case 'bottom-center':
                $x = floor(($width - $mw) / 2);
                $y = $height - $options->margin;
                if ($options->type == 'image') {
                    $y = $height - $mh - $options->margin;
                }
                break;
            case 'bottom-left':
                $x = 0 + $options->margin;
                $y = $height - $options->margin;

                if ($options->type == 'image') {
                    $y = $height - $mh - $options->margin;
                }
                break;
            case 'bottom-right':
                $x = $width - $mw - $options->margin;
                $y = $height - $options->margin;

                if ($options->type == 'image') {
                    $y = $height - $mh - $options->margin;
                }
                break;
        }

        return array('x' => $x, 'y' => $y);
    }

    private function watermarkText($options) {
        $font = $options->font_style;

        if (is_file($font)) {
            $box = imagettfbbox((int) $options->font_size, $options->angle, $font, $options->text);

            $x0 = min($box[0], $box[2], $box[4], $box[6]) - (int) $options->margin;
            $x1 = max($box[0], $box[2], $box[4], $box[6]) + (int) $options->margin;
            $y0 = min($box[1], $box[3], $box[5], $box[7]) - (int) $options->margin;
            $y1 = max($box[1], $box[3], $box[5], $box[7]) + (int) $options->margin;

            $mw = abs($x1 - $x0);
            $mh = abs($y1 - $y0);

            $position = $this->getWatermarkPosition($options, $mw, $mh);

            $options->font_color = preg_replace('#[^\w]+#', '', $options->font_color);

            $color = imagecolorallocatealpha($this->handle, hexdec(substr($options->font_color, 0, 2)), hexdec(substr($options->font_color, 2, 2)), hexdec(substr($options->font_color, 4, 2)), 127 * ( 100 - (int) $options->opacity ) / 100);

            imagettftext($this->handle, (int) $options->font_size, $options->angle, $position['x'], $position['y'], $color, $font, $options->text);
        }
    }

    /**
     * PNG ALPHA CHANNEL SUPPORT for imagecopymerge(); 
     * This is a function like imagecopymerge but it handle alpha channel well!!! 
     * A fix to get a function like imagecopymerge WITH ALPHA SUPPORT 
     * Main script by aiden.mail@freemail.hu 
     * Transformed to imagecopymerge_alpha() by rodrigo.polo@gmail.com
     * http://www.php.net/manual/en/function.imagecopymerge.php#88456
     */
    private static function imagecopymerge_alpha($dst_im, $src_im, $dst_x, $dst_y, $src_x, $src_y, $src_w, $src_h, $pct) {
        if (!isset($pct)) {
            return false;
        }
        $pct /= 100;
        // Get image width and height 
        $w = imagesx($src_im);
        $h = imagesy($src_im);
        // Turn alpha blending off 
        imagealphablending($src_im, false);
        // Find the most opaque pixel in the image (the one with the smallest alpha value) 
        $minalpha = 127;
        for ($x = 0; $x < $w; $x++)
            for ($y = 0; $y < $h; $y++) {
                $alpha = ( imagecolorat($src_im, $x, $y) >> 24 ) & 0xFF;
                if ($alpha < $minalpha) {
                    $minalpha = $alpha;
                }
            }
        //loop through image pixels and modify alpha for each 
        for ($x = 0; $x < $w; $x++) {
            for ($y = 0; $y < $h; $y++) {
                //get current alpha value (represents the TANSPARENCY!) 
                $colorxy = imagecolorat($src_im, $x, $y);
                $alpha = ( $colorxy >> 24 ) & 0xFF;
                //calculate new alpha 
                if ($minalpha !== 127) {
                    $alpha = 127 + 127 * $pct * ( $alpha - 127 ) / ( 127 - $minalpha );
                } else {
                    $alpha += 127 * $pct;
                }
                //get the color index with new alpha 
                $alphacolorxy = imagecolorallocatealpha($src_im, ( $colorxy >> 16 ) & 0xFF, ( $colorxy >> 8 ) & 0xFF, $colorxy & 0xFF, $alpha);
                //set pixel with the new color + opacity 
                if (!imagesetpixel($src_im, $x, $y, $alphacolorxy)) {
                    return false;
                }
            }
        }
        // The image copy 
        imagecopy($dst_im, $src_im, $dst_x, $dst_y, $src_x, $src_y, $src_w, $src_h);
    }

    public function watermark($options) {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        $mark = null;

        if ($options->type == 'text') {
            if (isset($options->text)) {
                $this->watermarkText($options);
            }
        } else {
            if (isset($options->image)) {
                $mark = new WFImageGD($options->image);
            }
        }

        if ($mark && is_resource($mark->handle) && get_resource_type($mark->handle) == 'gd') {

            $mw = imagesx($mark->handle);
            $mh = imagesy($mark->handle);

            $position = $this->getWatermarkPosition($options, $mw, $mh);

            if (exif_imagetype($options->image) === IMAGETYPE_PNG) {
                self::imagecopymerge_alpha($this->handle, $mark->handle, $position['x'], $position['y'], 0, 0, $mw, $mh, $options->opacity);
            } else {
                // Allow transparency for the new image handle.
                imagealphablending($mark->handle, false);
                imagesavealpha($mark->handle, true);

                imagecopymerge($this->handle, $mark->handle, $position['x'], $position['y'], 0, 0, $mw, $mh, $options->opacity);
            }
        }

        return $this;
    }

    /**
     * Method to resize the current image.
     *
     * @param   mixed    $width        The width of the resized image in pixels or a percentage.
     * @param   mixed    $height       The height of the resized image in pixels or a percentage.
     * @param   bool     $createNew    If true the current image will be cloned, resized and returned; else
     * the current image will be resized and returned.
     * @param   integer  $scaleMethod  Which method to use for scaling
     *
     * @return  JImage
     *
     * @since   11.3
     * @throws  LogicException
     */
    public function resize($width, $height, $createNew = false) {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        // Create the new truecolor image handle.
        $handle = imagecreatetruecolor($width, $height);

        // Allow transparency for the new image handle.
        imagealphablending($handle, false);
        imagesavealpha($handle, true);

        if ($this->isTransparent()) {
            // Get the transparent color values for the current image.
            $rgba = imageColorsForIndex($this->handle, imagecolortransparent($this->handle));
            $color = imageColorAllocate($this->handle, $rgba['red'], $rgba['green'], $rgba['blue']);

            // Set the transparent color values for the new image.
            imagecolortransparent($handle, $color);
            imagefill($handle, 0, 0, $color);

            imagecopyresized($handle, $this->handle, 0, 0, 0, 0, $width, $height, $this->getWidth(), $this->getHeight());
        } else {
            imagecopyresampled($handle, $this->handle, 0, 0, 0, 0, $width, $height, $this->getWidth(), $this->getHeight());
        }

        // If we are resizing to a new image, create a new JImage object.
        if ($createNew) {
            $new = new WFImageGD($handle);

            return $new;
        }
        // Swap out the current handle for the new image handle.
        else {
            $this->handle = $handle;
            return $this;
        }
    }

    /**
     * Method to crop the current image.
     *
     * @param   mixed    $width      The width of the image section to crop in pixels or a percentage.
     * @param   mixed    $height     The height of the image section to crop in pixels or a percentage.
     * @param   integer  $left       The number of pixels from the left to start cropping.
     * @param   integer  $top        The number of pixels from the top to start cropping.
     * @param   bool     $createNew  If true the current image will be cloned, cropped and returned; else
     *                               the current image will be cropped and returned.
     *
     * @return  JImage
     *
     * @since   11.3
     * @throws  LogicException
     */
    public function crop($width, $height, $left, $top, $createNew = false) {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        // Create the new truecolor image handle.
        $handle = imagecreatetruecolor($width, $height);

        // Allow transparency for the new image handle.
        imagealphablending($handle, false);
        imagesavealpha($handle, true);

        if ($this->isTransparent()) {
            // Get the transparent color values for the current image.
            $rgba = imageColorsForIndex($this->handle, imagecolortransparent($this->handle));
            $color = imageColorAllocate($this->handle, $rgba['red'], $rgba['green'], $rgba['blue']);

            // Set the transparent color values for the new image.
            imagecolortransparent($handle, $color);
            imagefill($handle, 0, 0, $color);

            imagecopyresized($handle, $this->handle, 0, 0, $left, $top, $width, $height, $width, $height);
        } else {
            imagecopyresampled($handle, $this->handle, 0, 0, $left, $top, $width, $height, $width, $height);
        }

        // If we are cropping to a new image, create a new JImage object.
        if ($createNew) {
            // @codeCoverageIgnoreStart
            $new = new WFImageGD($handle);

            return $new;
            // @codeCoverageIgnoreEnd
        }
        // Swap out the current handle for the new image handle.
        else {
            $this->handle = $handle;

            return $this;
        }
    }

    /**
     * Method to rotate the current image.
     *
     * @param   mixed    $angle       The angle of rotation for the image
     * @param   integer  $background  The background color to use when areas are added due to rotation
     * @param   bool     $createNew   If true the current image will be cloned, rotated and returned; else
     * the current image will be rotated and returned.
     *
     * @return  JImage
     *
     * @since   11.3
     * @throws  LogicException
     */
    public function rotate($angle, $background = -1, $createNew = false) {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        // Create the new truecolor image handle.
        $handle = imagecreatetruecolor($this->getWidth(), $this->getHeight());

        // Allow transparency for the new image handle.
        imagealphablending($handle, false);
        imagesavealpha($handle, true);

        // Copy the image
        imagecopy($handle, $this->handle, 0, 0, 0, 0, $this->getWidth(), $this->getHeight());

        // Rotate the image
        $handle = imagerotate($handle, $angle, $background);

        // If we are resizing to a new image, create a new JImage object.
        if ($createNew) {
            $new = new WFImageGD($handle);

            return $new;
        }
        // Swap out the current handle for the new image handle.
        else {
            $this->handle = $handle;

            return $this;
        }
    }

    public static function getImageType($string) {
        switch ($string) {
            case 'jpeg':
            case 'jpg':
            default:
                return IMAGETYPE_JPEG;
                break;
            case 'png':
                return IMAGETYPE_PNG;
                break;
            case 'gif':
                return IMAGETYPE_GIF;
                break;
        }
    }

    /**
     * Method to write the current image out to a file.
     *
     * @param   string   $path     The filesystem path to save the image.
     * @param   integer  $type     The image type to save the file as.
     * @param   array    $options  The image type options to use in saving the file.
     *
     * @return  void
     *
     * @see     http://www.php.net/manual/image.constants.php
     * @since   11.3
     * @throws  LogicException
     */
    public function toFile($path, $type = IMAGETYPE_JPEG, array $options = array()) {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        if (is_string($type)) {
            $type = self::getImageType($type);
        }

        switch ($type) {
            case IMAGETYPE_GIF:
                imagegif($this->handle, $path);
                break;

            case IMAGETYPE_PNG:
                imagepng($this->handle, $path, (array_key_exists('quality', $options)) ? $options['quality'] : 0);
                break;

            case IMAGETYPE_JPEG:
            default:
                imagejpeg($this->handle, $path, (array_key_exists('quality', $options)) ? $options['quality'] : 100);
        }

        $this->destroy();
    }

    /**
     * Method to write the current image out to a file.
     *
     * @param   string   $path     The filesystem path to save the image.
     * @param   integer  $type     The image type to save the file as.
     * @param   array    $options  The image type options to use in saving the file.
     *
     * @return  void
     *
     * @see     http://www.php.net/manual/image.constants.php
     * @since   11.3
     * @throws  LogicException
     */
    public function toString($type = IMAGETYPE_JPEG, array $options = array()) {
        // Make sure the resource handle is valid.
        if (!$this->isLoaded()) {
            throw new LogicException('No valid image was loaded');
        }

        switch ($type) {
            case IMAGETYPE_GIF:
                imagegif($this->handle);
                break;

            case IMAGETYPE_PNG:
                imagepng($this->handle, null, (array_key_exists('quality', $options)) ? $options['quality'] : 0);
                break;

            case IMAGETYPE_JPEG:
            default:
                imagejpeg($this->handle, null, (array_key_exists('quality', $options)) ? $options['quality'] : 100);
        }

        $this->destroy();
    }

    /**
     * Method to get an image filter instance of a specified type.
     *
     * @param   string  $type  The image filter type to get.
     *
     * @return  JImageFilter
     *
     * @since   11.3
     * @throws  RuntimeException
     */
    protected function getFilterInstance($type) {
        // Sanitize the filter type.
        $type = strtolower(preg_replace('#[^A-Z0-9_]#i', '', $type));

        // load the filter
        require_once(dirname(__FILE__) . '/filters/' . $type . '.php');

        // Verify that the filter type exists.
        $className = 'WFImageGDFilter' . ucfirst($type);

        if (!class_exists($className)) {
            throw new RuntimeException('The ' . ucfirst($type) . ' image filter is not available.');
        }

        // Instantiate the filter object.
        $instance = new $className($this->handle);

        // Verify that the filter type is valid.
        if (!($instance instanceof WFImageGDFilter)) {
            throw new RuntimeException('The ' . ucfirst($type) . ' image filter is not valid.');
        }

        return $instance;
    }

    public function destroy() {
        imagedestroy($this->handle);
    }

}
